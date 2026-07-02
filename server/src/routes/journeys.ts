import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { advancePastAutoSteps, createRun, runCounts } from '../services/runEngine';

const router = Router();

function serializeJourney(j: any) {
  return {
    id: j.id,
    name: j.name,
    desc: j.description,
    modules: j.connectedModules,
    coverage: j.coveragePct,
    humanSteps: j.humanSteps,
    aiSteps: j.aiSteps,
    status: j.status,
    risk: j.riskLevel,
    updated: j.updatedAt,
  };
}

function serializeStep(s: any) {
  return {
    id: s.id,
    seq: s.seq,
    name: s.name,
    chips: s.chips,
    source: s.source,
    desc: s.description,
    validation: s.validation,
    human: s.humanIntervention,
    failure: s.failureHandling,
    fields: s.fieldsFetched,
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const journeys = await prisma.journey.findMany({ orderBy: { name: 'asc' } });
    res.json(journeys.map(serializeJourney));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const journey = await prisma.journey.findUnique({ where: { id: req.params.id } });
    if (!journey) return res.status(404).json({ error: 'Journey not found' });
    res.json(serializeJourney(journey));
  } catch (e) {
    next(e);
  }
});

router.get('/:id/steps', async (req, res, next) => {
  try {
    const steps = await prisma.journeyStep.findMany({
      where: { journeyId: req.params.id },
      orderBy: { seq: 'asc' },
    });
    res.json(steps.map(serializeStep));
  } catch (e) {
    next(e);
  }
});

const automationConfigSchema = z.object({
  name: z.string().optional(),
  entity: z.string().optional(),
  country: z.string().optional(),
  employmentType: z.string().optional(),
  effectiveFrom: z.string().optional(),
  trigger: z.string().optional(),
  mode: z.enum(['draft', 'active']),
  scope: z
    .array(
      z.object({
        stepId: z.string(),
        aiAutomate: z.boolean().default(false),
        humanApproval: z.boolean().default(false),
        autoMoveNext: z.boolean().default(false),
        exceptionHandling: z.string().default('stop'),
      })
    )
    .default([]),
});

// Ports saveAIAutomation(mode) — split from the mockup's single function into a
// config save + a journey status update, run in one transaction.
router.post('/:id/automations', async (req, res, next) => {
  try {
    const body = automationConfigSchema.parse(req.body);
    const journeyId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const config = await tx.automationConfig.create({
        data: {
          journeyId,
          name: body.name,
          entity: body.entity,
          country: body.country,
          employmentType: body.employmentType,
          effectiveFrom: body.effectiveFrom,
          trigger: body.trigger,
          status: body.mode,
        },
      });

      if (body.scope.length > 0) {
        await tx.automationScope.createMany({
          data: body.scope.map((s) => ({
            configId: config.id,
            stepId: s.stepId,
            aiAutomate: s.aiAutomate,
            humanApproval: s.humanApproval,
            autoMoveNext: s.autoMoveNext,
            exceptionHandling: s.exceptionHandling,
          })),
        });
      }

      const journey = await tx.journey.update({
        where: { id: journeyId },
        data: { status: body.mode === 'active' ? 'Active' : 'Draft', updatedAt: new Date() },
      });

      return { config, journey };
    });

    res.status(201).json({ configId: result.config.id, journey: serializeJourney(result.journey) });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/automations/latest', async (req, res, next) => {
  try {
    const config = await prisma.automationConfig.findFirst({
      where: { journeyId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: { scope: true },
    });
    res.json(config);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/runs', async (req, res, next) => {
  try {
    const runs = await prisma.automationRun.findMany({
      where: { journeyId: req.params.id },
      orderBy: { lastActivityAt: 'desc' },
    });
    const withCounts = await Promise.all(
      runs.map(async (r) => ({
        runId: r.runCode,
        client: r.client,
        country: r.country,
        contractType: r.contractType,
        currentStepIdx: r.currentStepIndex,
        status: r.status,
        exceptionNote: r.exceptionNote,
        lastActivity: r.lastActivityAt,
        ...(await runCounts(r.id)),
      }))
    );
    res.json(withCounts);
  } catch (e) {
    next(e);
  }
});

const createRunSchema = z.object({
  client: z.string(),
  country: z.string(),
  contractType: z.string(),
  contractId: z.string().optional(),
});

router.post('/:id/runs', async (req, res, next) => {
  try {
    const body = createRunSchema.parse(req.body);
    const journeyId = req.params.id;
    const count = await prisma.automationRun.count({ where: { journeyId } });
    const runCode = `RUN-${1000 + count + 1}`;
    const run = await createRun({ journeyId, runCode, ...body });
    res.status(201).json({ runId: run.runCode, status: run.status });
  } catch (e) {
    next(e);
  }
});

export default router;
