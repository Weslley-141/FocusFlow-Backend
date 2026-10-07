import { AppDataSource } from '../config/data-source';
import { MindMap } from '../entities/MindMap';
import { MindMapNode } from '../entities/MindMapNode';
import { Topic } from '../entities/Topic';
import { AppError } from '../utils/AppError';
import { has, hexColor, num, optId, optString, reqString, toId } from '../utils/validators';

const maps = () => AppDataSource.getRepository(MindMap);
const nodes = () => AppDataSource.getRepository(MindMapNode);

const toMapDto = (m: MindMap, nodesCount = m.nodesCount ?? 0) => ({
  id: m.id,
  title: m.title,
  description: m.description,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
  topicId: m.topicId,
  topicName: m.topic?.name ?? null,
  nodesCount,
});

async function findMap(userId: number, id: number) {
  const map = await maps().findOne({ where: { id, userId }, relations: { topic: true } });
  if (!map) throw new AppError('Mapa mental não encontrado', 404);
  return map;
}

/** Busca o nó garantindo que o mapa pertence ao usuário (RN-14). */
async function findNode(userId: number, nodeId: number) {
  const node = await nodes().findOne({ where: { id: nodeId }, relations: { mindMap: true } });
  if (!node || !node.mindMap || node.mindMap.userId !== userId) throw new AppError('Nó não encontrado', 404);
  return node;
}

function nodeDto(n: MindMapNode) {
  return {
    id: n.id,
    content: n.content,
    level: n.level,
    parentId: n.parentId,
    positionX: n.positionX,
    positionY: n.positionY,
    backgroundColor: n.backgroundColor,
    textColor: n.textColor,
    sourceHandle: n.sourceHandle,
    targetHandle: n.targetHandle,
    mindMapId: n.mindMapId,
  };
}

async function resolveParent(mapId: number, parentId: number | null, selfId?: number) {
  if (parentId === null) return null;
  if (selfId && parentId === selfId) throw new AppError('Um nó não pode ser pai dele mesmo', 400);
  const parent = await nodes().findOne({ where: { id: parentId, mindMapId: mapId } });
  if (!parent) throw new AppError('Nó pai não encontrado neste mapa', 404);
  return parent;
}

export const mindmapsService = {
  async list(userId: number) {
    const rows = await maps()
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.topic', 'topic')
      .loadRelationCountAndMap('m.nodesCount', 'm.nodes')
      .where('m.userId = :userId', { userId })
      .orderBy('m.createdAt', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .getMany();
    return rows.map((m) => toMapDto(m));
  },

  async create(userId: number, body: any) {
    const topicId = optId(body?.topicId, 'topicId');
    if (topicId) {
      const topic = await AppDataSource.getRepository(Topic).findOne({ where: { id: topicId, userId } });
      if (!topic) throw new AppError('Tópico não encontrado', 404);
    }
    const saved = await maps().save(
      maps().create({ userId, title: reqString(body?.title, 'Título do mapa'), description: optString(body?.description, 'Descrição'), topicId }),
    );
    return toMapDto(await findMap(userId, saved.id), 0);
  },

  async getById(userId: number, id: number) {
    const map = await findMap(userId, id);
    const count = await nodes().count({ where: { mindMapId: id } });
    return { ...toMapDto(map, count), nodes: (await nodes().find({ where: { mindMapId: id }, order: { id: 'ASC' } })).map(nodeDto) };
  },

  async update(userId: number, id: number, body: any) {
    const map = await findMap(userId, id);
    if (has(body, 'title')) map.title = reqString(body.title, 'Título do mapa');
    if (has(body, 'description')) map.description = optString(body.description, 'Descrição');
    if (has(body, 'topicId')) {
      const topicId = optId(body.topicId, 'topicId');
      if (topicId && !(await AppDataSource.getRepository(Topic).findOne({ where: { id: topicId, userId } }))) {
        throw new AppError('Tópico não encontrado', 404);
      }
      map.topicId = topicId;
      delete (map as Partial<MindMap>).topic;
    }
    await maps().save(map);
    return toMapDto(await findMap(userId, id), await nodes().count({ where: { mindMapId: id } }));
  },

  async remove(userId: number, id: number) {
    await maps().remove(await findMap(userId, id)); // nós saem em cascata
  },

  async getNodes(userId: number, mapId: number) {
    await findMap(userId, mapId);
    return (await nodes().find({ where: { mindMapId: mapId }, order: { id: 'ASC' } })).map(nodeDto);
  },

  async createNode(userId: number, mapId: number, body: any) {
    await findMap(userId, mapId);
    const parentId = optId(body?.parentId, 'parentId');
    const parent = await resolveParent(mapId, parentId);
    const siblings = await nodes().count({ where: { mindMapId: mapId } });
    const level = has(body, 'level') && body.level !== null ? Math.max(0, Math.trunc(num(body.level, 'level'))) : parent ? parent.level + 1 : 0;
    const node = nodes().create({
      mindMapId: mapId,
      content: reqString(body?.content, 'Conteúdo do nó', 500),
      level,
      parentId,
      positionX: has(body, 'positionX') && body.positionX !== null ? num(body.positionX, 'positionX') : level * 260,
      positionY: has(body, 'positionY') && body.positionY !== null ? num(body.positionY, 'positionY') : siblings * 90,
      backgroundColor: has(body, 'backgroundColor') && body.backgroundColor ? hexColor(body.backgroundColor, 'backgroundColor') : '#ffffff',
      textColor: has(body, 'textColor') && body.textColor ? hexColor(body.textColor, 'textColor') : '#000000',
      sourceHandle: optString(body?.sourceHandle, 'sourceHandle', 50),
      targetHandle: optString(body?.targetHandle, 'targetHandle', 50),
    });
    return nodeDto(await nodes().save(node));
  },

  async updateNode(userId: number, nodeId: number, body: any) {
    const node = await findNode(userId, nodeId);
    delete (node as Partial<MindMapNode>).mindMap;
    if (has(body, 'content')) node.content = reqString(body.content, 'Conteúdo do nó', 500);
    if (has(body, 'backgroundColor')) node.backgroundColor = hexColor(body.backgroundColor, 'backgroundColor'); // RN-13
    if (has(body, 'textColor')) node.textColor = hexColor(body.textColor, 'textColor');
    if (has(body, 'positionX')) node.positionX = num(body.positionX, 'positionX');
    if (has(body, 'positionY')) node.positionY = num(body.positionY, 'positionY');
    if (has(body, 'sourceHandle')) node.sourceHandle = optString(body.sourceHandle, 'sourceHandle', 50);
    if (has(body, 'targetHandle')) node.targetHandle = optString(body.targetHandle, 'targetHandle', 50);
    if (has(body, 'parentId')) {
      const parentId = optId(body.parentId, 'parentId');
      const parent = await resolveParent(node.mindMapId, parentId, node.id);
      node.parentId = parentId;
      node.level = parent ? parent.level + 1 : 0;
      if (!parent) {
        node.sourceHandle = has(body, 'sourceHandle') ? node.sourceHandle : null;
        node.targetHandle = has(body, 'targetHandle') ? node.targetHandle : null;
      }
    }
    if (has(body, 'level') && body.level !== null) node.level = Math.max(0, Math.trunc(num(body.level, 'level')));
    return nodeDto(await nodes().save(node));
  },

  async updateNodePosition(userId: number, nodeId: number, body: any) {
    const node = await findNode(userId, nodeId);
    delete (node as Partial<MindMapNode>).mindMap;
    node.positionX = num(body?.positionX, 'positionX');
    node.positionY = num(body?.positionY, 'positionY');
    return nodeDto(await nodes().save(node));
  },

  async deleteNode(userId: number, nodeId: number) {
    const node = await findNode(userId, nodeId);
    await nodes().delete(node.id); // filhos ficam com parentId = NULL (ON DELETE SET NULL)
  },
};
