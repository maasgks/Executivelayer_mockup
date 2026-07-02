import express from 'express';
import cors from 'cors';

import journeysRouter from './routes/journeys';
import runsRouter from './routes/runs';
import contractsRouter from './routes/contracts';
import proposalsRouter from './routes/proposals';
import notificationsRouter from './routes/notifications';
import employeesRouter from './routes/employees';
import contractAssistantRouter from './routes/contractAssistant';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/journeys', journeysRouter);
  app.use('/api/runs', runsRouter);
  app.use('/api/contracts', contractsRouter);
  app.use('/api/proposals', proposalsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/employees', employeesRouter);
  app.use('/api/contract-assistant', contractAssistantRouter);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}
