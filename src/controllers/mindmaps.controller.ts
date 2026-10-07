import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/response';
import { toId } from '../utils/validators';
import { mindmapsService } from '../services/mindmaps.service';

export const mindmapsController = {
  list: asyncHandler(async (req, res) => ok(res, await mindmapsService.list(req.userId))),
  create: asyncHandler(async (req, res) => created(res, await mindmapsService.create(req.userId, req.body))),
  getById: asyncHandler(async (req, res) => ok(res, await mindmapsService.getById(req.userId, toId(req.params.id)))),
  update: asyncHandler(async (req, res) => ok(res, await mindmapsService.update(req.userId, toId(req.params.id), req.body))),
  remove: asyncHandler(async (req, res) => {
    await mindmapsService.remove(req.userId, toId(req.params.id));
    return noContent(res);
  }),
  getNodes: asyncHandler(async (req, res) => ok(res, await mindmapsService.getNodes(req.userId, toId(req.params.id)))),
  createNode: asyncHandler(async (req, res) =>
    created(res, await mindmapsService.createNode(req.userId, toId(req.params.id), req.body)),
  ),
  updateNode: asyncHandler(async (req, res) =>
    ok(res, await mindmapsService.updateNode(req.userId, toId(req.params.nodeId, 'nodeId'), req.body)),
  ),
  updateNodePosition: asyncHandler(async (req, res) =>
    ok(res, await mindmapsService.updateNodePosition(req.userId, toId(req.params.nodeId, 'nodeId'), req.body)),
  ),
  deleteNode: asyncHandler(async (req, res) => {
    await mindmapsService.deleteNode(req.userId, toId(req.params.nodeId, 'nodeId'));
    return noContent(res);
  }),
};
