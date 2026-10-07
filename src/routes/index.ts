import { Router } from 'express';
import authRoutes from './auth.routes';
import subjectsRoutes from './subjects.routes';
import topicsRoutes from './topics.routes';
import flashcardsRoutes from './flashcards.routes';
import pomodoroRoutes from './pomodoro.routes';
import goalsRoutes from './goals.routes';
import mindmapsRoutes from './mindmaps.routes';

const router = Router();
router.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/topics', topicsRoutes);
router.use('/flashcards', flashcardsRoutes);
router.use('/pomodoro', pomodoroRoutes);
router.use('/goals', goalsRoutes);
router.use('/mindmaps', mindmapsRoutes);
export default router;
