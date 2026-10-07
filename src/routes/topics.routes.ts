import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { topicsController as c } from '../controllers/topics.controller';

const router = Router();
router.use(authenticate);
router.get('/subject/:subjectId', c.listBySubject);
router.post('/', c.create);
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
