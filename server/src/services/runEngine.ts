import { prisma } from '../db';
import { logActivity } from './activityLog';

const HUMAN_GATE_CHIPS = ['Human Required', 'Approval Required'];

function isHumanGate(chips: string[]) {
  return chips.some((c) => HUMAN_GATE_CHIPS.includes(c));
}

// Creates a run and seeds one RunStep per journey step: everything before the
// starting index is DONE, the starting index is CURRENT, the rest PENDING.
export async function createRun(params: {
  journeyId: string;
  runCode: string;
  client: string;
  country: string;
  contractType: string;
  contractId?: string | null;
}) {
  const steps = await prisma.journeyStep.findMany({
    where: { journeyId: params.journeyId },
    orderBy: { seq: 'asc' },
  });
  if (steps.length === 0) throw Object.assign(new Error('Journey has no steps'), { status: 400 });

  const run = await prisma.automationRun.create({
    data: {
      runCode: params.runCode,
      journeyId: params.journeyId,
      client: params.client,
      country: params.country,
      contractType: params.contractType,
      contractId: params.contractId ?? null,
      currentStepIndex: 0,
      status: 'ACTIVE',
    },
  });

  await prisma.runStep.createMany({
    data: steps.map((step, idx) => ({
      runId: run.id,
      stepId: step.id,
      status: idx === 0 ? 'CURRENT' : 'PENDING',
      startedAt: idx === 0 ? new Date() : null,
    })),
  });

  await logActivity({
    entityType: 'automation_run',
    entityId: run.id,
    kind: 'workflow',
    title: 'Run started',
    description: `${params.client} entered the ${params.journeyId} journey.`,
    status: 'Active',
  });

  return advancePastAutoSteps(run.id);
}

// Ports aiAdvanceRunPastAutoSteps(): walk forward from the current step, auto-completing
// every step that isn't a human/approval gate, stopping at the next gate (or completing
// the run if none remain). Writes real RunStep rows instead of only moving a pointer.
export async function advancePastAutoSteps(runId: string) {
  const run = await prisma.automationRun.findUniqueOrThrow({
    where: { id: runId },
    include: { journey: { include: { steps: { orderBy: { seq: 'asc' } } } } },
  });
  const steps = run.journey.steps;

  // Close out the step we're advancing past.
  const current = steps[run.currentStepIndex];
  if (current) {
    await prisma.runStep.updateMany({
      where: { runId: run.id, stepId: current.id },
      data: { status: 'DONE', completedAt: new Date() },
    });
  }

  let idx = run.currentStepIndex + 1;
  while (idx < steps.length) {
    const step = steps[idx];
    if (isHumanGate(step.chips)) break;

    await prisma.runStep.updateMany({
      where: { runId: run.id, stepId: step.id },
      data: { status: 'DONE', startedAt: new Date(), completedAt: new Date() },
    });
    await logActivity({
      entityType: 'automation_run',
      entityId: run.id,
      kind: 'log',
      title: step.name,
      description: `${step.name} completed automatically.`,
      status: 'Completed',
    });
    idx++;
  }

  const completed = idx >= steps.length;
  const finalIndex = completed ? steps.length - 1 : idx;
  const finalStatus = completed ? 'COMPLETED' : 'WAITING_FOR_APPROVAL';

  if (!completed) {
    await prisma.runStep.updateMany({
      where: { runId: run.id, stepId: steps[idx].id },
      data: { status: 'CURRENT', startedAt: new Date() },
    });
  }

  const updated = await prisma.automationRun.update({
    where: { id: run.id },
    data: {
      currentStepIndex: finalIndex,
      status: finalStatus,
      exceptionNote: null,
      lastActivityAt: new Date(),
    },
  });

  await logActivity({
    entityType: 'automation_run',
    entityId: run.id,
    kind: 'workflow',
    title: completed ? 'Journey complete' : `Waiting on: ${steps[finalIndex]?.name}`,
    status: finalStatus,
  });

  return updated;
}

// Reject currently has no defined backward-navigation semantics in the mockup
// (aiRejectRunStep never changes status/currentStepIdx there either) — this
// records the rejection on the audit trail without moving the run.
export async function rejectRun(runId: string, note?: string) {
  const run = await prisma.automationRun.update({
    where: { id: runId },
    data: { lastActivityAt: new Date() },
  });
  await logActivity({
    entityType: 'automation_run',
    entityId: runId,
    kind: 'log',
    title: 'Sent back for correction',
    description: note || 'Reviewer rejected the current step.',
    status: 'Rejected',
  });
  return run;
}

export async function markException(runId: string, note: string) {
  const run = await prisma.automationRun.findUniqueOrThrow({
    where: { id: runId },
    include: { journey: { include: { steps: { orderBy: { seq: 'asc' } } } } },
  });
  const step = run.journey.steps[run.currentStepIndex];
  if (step) {
    await prisma.runStep.updateMany({
      where: { runId: run.id, stepId: step.id },
      data: { status: 'EXCEPTION' },
    });
  }
  const updated = await prisma.automationRun.update({
    where: { id: runId },
    data: { status: 'EXCEPTION', exceptionNote: note, lastActivityAt: new Date() },
  });
  await logActivity({
    entityType: 'automation_run',
    entityId: runId,
    kind: 'log',
    title: 'Exception raised',
    description: note,
    status: 'Exception',
  });
  return updated;
}

// aiRunCounts(): counts AI-completed steps and steps currently blocking on a human.
export async function runCounts(runId: string) {
  const runSteps = await prisma.runStep.findMany({
    where: { runId },
    include: { step: true },
  });
  let aiCompleted = 0;
  let humanPending = 0;
  for (const rs of runSteps) {
    if (rs.status === 'DONE' && rs.step.chips.includes('AI Automated')) aiCompleted++;
    if (rs.status === 'CURRENT' || rs.status === 'EXCEPTION') humanPending++;
  }
  return { aiCompleted, humanPending };
}
