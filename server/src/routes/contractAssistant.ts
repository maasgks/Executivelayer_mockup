import { Router } from 'express';
import { z } from 'zod';
import { findExistingEmployee, parsePrompt } from '../services/contractAssistant';

const router = Router();

const parseSchema = z.object({ text: z.string() });

router.post('/parse', (req, res, next) => {
  try {
    const body = parseSchema.parse(req.body);
    res.json(parsePrompt(body.text));
  } catch (e) {
    next(e);
  }
});

router.get('/lookup', async (req, res, next) => {
  try {
    const name = typeof req.query.name === 'string' ? req.query.name : '';
    const employee = await findExistingEmployee(name);
    res.json(employee);
  } catch (e) {
    next(e);
  }
});

export default router;
