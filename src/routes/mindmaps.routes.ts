import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { mindmapsController as c } from '../controllers/mindmaps.controller';

const router = Router();
router.use(authenticate);
router.get('/', c.list);
router.post('/', c.create);
// nós (rotas mais específicas primeiro)
router.patch('/nodes/:nodeId/position', c.updateNodePosition);
router.put('/nodes/:nodeId', c.updateNode);
router.delete('/nodes/:nodeId', c.deleteNode);
router.get('/:id/nodes', c.getNodes);
router.post('/:id/nodes', c.createNode);
// mapas
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
