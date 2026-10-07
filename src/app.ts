import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      // sem Origin (curl, Render health check) ou origem liberada em FRONTEND_URL
      if (!origin || env.frontendUrls.includes('*') || env.frontendUrls.includes(origin)) return cb(null, true);
      cb(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ name: 'FocusFlow API', status: 'ok' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
