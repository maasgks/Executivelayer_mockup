import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const employees = await prisma.employee.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
    });
    res.json(employees);
  } catch (e) {
    next(e);
  }
});

export default router;
