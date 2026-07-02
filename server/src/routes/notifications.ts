import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const pendingOnly = req.query.pending === 'true';
    const notifications = await prisma.notification.findMany({
      where: pendingOnly ? { pending: true } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (e) {
    next(e);
  }
});

router.post('/mark-all-read', async (_req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { pending: true }, data: { pending: false } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/read', async (req, res, next) => {
  try {
    const n = await prisma.notification.update({ where: { id: req.params.id }, data: { pending: false } });
    res.json(n);
  } catch (e) {
    next(e);
  }
});

export default router;
