import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { logActivity } from '../services/activityLog';
import { createRun, advancePastAutoSteps } from '../services/runEngine';

const router = Router();

function genProposalCode() {
  return 'PRP-' + String(10000 + Math.floor(Math.random() * 89999));
}

const createProposalSchema = z.object({
  contractId: z.string(),
  dealManager: z.string().default('Karan Mehta'),
});

// Ports the proposal object built inline in aiSubmitAssistedContract() (aiProposalDraft).
router.post('/', async (req, res, next) => {
  try {
    const body = createProposalSchema.parse(req.body);
    const contract = await prisma.contract.findUnique({ where: { id: body.contractId } });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const proposal = await prisma.proposal.create({
      data: {
        proposalCode: genProposalCode(),
        contractId: contract.id,
        employeeName: contract.employeeName,
        country: contract.country,
        jobTitle: contract.jobTitle,
        type: contract.type,
        status: 'Draft',
        dealManager: body.dealManager,
      },
    });

    res.status(201).json(proposal);
  } catch (e) {
    next(e);
  }
});

// Ports aiSendProposalForApproval(): notifies the deal manager and moves the
// linked contract to 'Proposal Sent'.
router.post('/:id/submit-for-approval', async (req, res, next) => {
  try {
    const proposal = await prisma.proposal.findUnique({ where: { id: req.params.id } });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'Waiting for Approval', sentAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        title: `Proposal sent for approval — ${proposal.employeeName}`,
        relatedType: 'proposal',
        relatedId: proposal.id,
        pending: true,
      },
    });

    if (proposal.contractId) {
      await prisma.contract.update({ where: { id: proposal.contractId }, data: { status: 'Proposal Sent' } });
      await logActivity({
        entityType: 'contract',
        entityId: proposal.contractId,
        kind: 'log',
        title: 'Proposal Sent',
        description: `${proposal.type || 'EOR'} proposal sent to ${proposal.dealManager} for review.`,
        status: 'Proposal Sent',
      });
    }

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Ports aiSimulateApproval(): approves the proposal, moves the contract to
// 'Proposal Approved', and — closing the gap noted during exploration — spawns
// (or advances) the linked contract-to-payroll automation run.
router.post('/:id/approve', async (req, res, next) => {
  try {
    const proposal = await prisma.proposal.findUnique({ where: { id: req.params.id } });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: 'Approved', approvedAt: new Date() },
    });

    await prisma.notification.updateMany({
      where: { relatedType: 'proposal', relatedId: proposal.id, pending: true },
      data: { pending: false },
    });

    let run = null;
    if (proposal.contractId) {
      const contract = await prisma.contract.update({
        where: { id: proposal.contractId },
        data: { status: 'Proposal Approved' },
      });
      await logActivity({
        entityType: 'contract',
        entityId: proposal.contractId,
        kind: 'workflow',
        title: 'Proposal Approved',
        description: `Proposal approved by ${proposal.dealManager}.`,
        status: 'Proposal Approved',
        userName: proposal.dealManager || undefined,
      });

      const journeyId = 'contract-to-payroll';
      const existingRun = await prisma.automationRun.findFirst({ where: { contractId: contract.id } });
      if (existingRun) {
        run = await advancePastAutoSteps(existingRun.id);
      } else {
        const count = await prisma.automationRun.count({ where: { journeyId } });
        run = await createRun({
          journeyId,
          runCode: `RUN-${1000 + count + 1}`,
          client: contract.employeeName,
          country: contract.country,
          contractType: contract.type,
          contractId: contract.id,
        });
      }
    }

    res.json({ proposal: updated, run: run ? { runId: run.runCode, status: run.status } : null });
  } catch (e) {
    next(e);
  }
});

export default router;
