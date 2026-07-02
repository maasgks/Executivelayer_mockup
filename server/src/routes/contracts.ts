import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { computeCommercial } from '../services/commercialCalculator';
import { logActivity } from '../services/activityLog';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const contracts = await prisma.contract.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(contracts);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: { commercial: true, complianceItems: true },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    const logs = await prisma.activityLog.findMany({
      where: { entityType: 'contract', entityId: contract.id },
      orderBy: { occurredAt: 'desc' },
    });
    res.json({ ...contract, logs });
  } catch (e) {
    next(e);
  }
});

const createContractSchema = z.object({
  fname: z.string().optional(),
  lname: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  jobTitle: z.string().optional(),
  skill: z.string().optional(),
  jobDesc: z.string().optional(),
  hours: z.string().optional(),
  pay: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  workPermit: z.boolean().optional(),
  type: z.enum(['EOR', 'PEO', 'Contractor']),
  source: z.string().default('AI Contract Assistant'),
});

// Ports aiSubmitAssistedContract(): creates the contract + commercial terms +
// a default compliance item + an activity_log entry, mirroring the mockup's
// contractsData.push + ctLogsData/ctWorkflowData writes.
router.post('/', async (req, res, next) => {
  try {
    const body = createContractSchema.parse(req.body);
    const fullName = `${body.fname || ''} ${body.lname || ''}`.trim() || 'New Employee';
    const contractCode = String(90000 + Math.floor(Math.random() * 9999));
    const payAmount = body.pay ? Number(body.pay) : null;

    const contract = await prisma.contract.create({
      data: {
        contractCode,
        employeeName: fullName,
        designation: body.jobTitle || null,
        country: body.country || '—',
        type: body.type,
        status: 'Submitted',
        nationality: body.country || 'India',
        countryOfOperation: body.country || null,
        workPermit: body.workPermit === true,
        gender: (body.gender || '').toUpperCase() || null,
        email: body.email || null,
        contact: body.mobile || null,
        dob: body.dob || null,
        jobTitle: body.jobTitle || null,
        skill: body.skill || null,
        employmentStart: body.fromDate || null,
        employmentEnd: body.toDate || null,
        employmentType: body.type,
        workSchedule: body.hours || null,
        payAmount,
        currency: 'INR',
        jobDescription: body.jobDesc || null,
        payFrequency: 'Monthly',
      },
    });

    const commercial = await computeCommercial(payAmount, body.country);
    await prisma.contractCommercial.create({ data: { contractId: contract.id, ...commercial } });
    await prisma.contractComplianceItem.create({
      data: {
        contractId: contract.id,
        item: `${body.type} ${body.country || ''} Proposal`.trim(),
        note: 'Optional',
        status: 'Pending',
      },
    });

    await logActivity({
      entityType: 'contract',
      entityId: contract.id,
      kind: 'log',
      title: 'Contract Submitted',
      description: `Contract created via ${body.source} for ${fullName}.`,
      status: 'Submitted',
      userName: body.source,
    });
    await logActivity({
      entityType: 'contract',
      entityId: contract.id,
      kind: 'workflow',
      title: 'Contract Submitted',
      description: `${body.type} contract for ${fullName} submitted for quotation and review.`,
      status: 'Submitted',
      userName: body.source,
    });

    res.status(201).json(contract);
  } catch (e) {
    next(e);
  }
});

export default router;
