import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { subjectsController as c } from '../controllers/subjects.controller';

const router = Router();
router.use(authenticate);
router.get('/stats', c.stats);
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
