import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { advancePastAutoSteps, markException, rejectRun, runCounts } from '../services/runEngine';

const router = Router();

async function getRunByCode(runCode: string) {
  const run = await prisma.automationRun.findUnique({
    where: { runCode },
    include: {
      journey: { include: { steps: { orderBy: { seq: 'asc' } } } },
      steps: true,
      activityLogs: { orderBy: { occurredAt: 'desc' }, take: 20 },
    },
  });
  if (!run) return null;
  return run;
}

function serializeRun(run: NonNullable<Awaited<ReturnType<typeof getRunByCode>>>) {
  const statusByStepId = new Map(run.steps.map((s) => [s.stepId, s]));
  return {
    runId: run.runCode,
    client: run.client,
    country: run.country,
    contractType: run.contractType,
    status: run.status,
    currentStepIdx: run.currentStepIndex,
    exceptionNote: run.exceptionNote,
    lastActivity: run.lastActivityAt,
    journeyId: run.journeyId,
    steps: run.journey.steps.map((step, idx) => ({
      id: step.id,
      seq: step.seq,
      name: step.name,
      chips: step.chips,
      source: step.source,
      desc: step.description,
      validation: step.validation,
      human: step.humanIntervention,
      failure: step.failureHandling,
      fields: step.fieldsFetched,
      status: (statusByStepId.get(step.id)?.status || 'PENDING').toLowerCase(),
    })),
    activity: run.activityLogs.map((a) => ({
      title: a.title,
      description: a.description,
      status: a.status,
      occurredAt: a.occurredAt,
    })),
  };
}

router.get('/:runCode', async (req, res, next) => {
  try {
    const run = await getRunByCode(req.params.runCode);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(serializeRun(run));
  } catch (e) {
    next(e);
  }
});

router.post('/:runCode/approve', async (req, res, next) => {
  try {
    const run = await prisma.automationRun.findUnique({ where: { runCode: req.params.runCode } });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    await advancePastAutoSteps(run.id);
    const updated = await getRunByCode(req.params.runCode);
    res.json(serializeRun(updated!));
  } catch (e) {
    next(e);
  }
});

const rejectSchema = z.object({ note: z.string().optional() });

router.post('/:runCode/reject', async (req, res, next) => {
  try {
    const body = rejectSchema.parse(req.body || {});
    const run = await prisma.automationRun.findUnique({ where: { runCode: req.params.runCode } });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    await rejectRun(run.id, body.note);
    const updated = await getRunByCode(req.params.runCode);
    res.json(serializeRun(updated!));
  } catch (e) {
    next(e);
  }
});

router.post('/:runCode/resolve-exception', async (req, res, next) => {
  try {
    const run = await prisma.automationRun.findUnique({ where: { runCode: req.params.runCode } });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    await advancePastAutoSteps(run.id);
    const updated = await getRunByCode(req.params.runCode);
    res.json(serializeRun(updated!));
  } catch (e) {
    next(e);
  }
});

const exceptionSchema = z.object({ note: z.string() });

router.post('/:runCode/exception', async (req, res, next) => {
  try {
    const body = exceptionSchema.parse(req.body);
    const run = await prisma.automationRun.findUnique({ where: { runCode: req.params.runCode } });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    await markException(run.id, body.note);
    const updated = await getRunByCode(req.params.runCode);
    res.json(serializeRun(updated!));
  } catch (e) {
    next(e);
  }
});

router.get('/:runCode/counts', async (req, res, next) => {
  try {
    const run = await prisma.automationRun.findUnique({ where: { runCode: req.params.runCode } });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(await runCounts(run.id));
  } catch (e) {
    next(e);
  }
});

export default router;
