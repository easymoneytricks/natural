import { pool } from "../config/database.js";
import * as service from "../services/adminAttributes.service.js";
const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);
export const list = wrap(async (req, res) => res.json({ data: await service.list(pool, true) }));
export const create = wrap(async (req, res) => res.status(201).json({ data: await service.create(pool, req.body, req.admin.id, req) }));
export const update = wrap(async (req, res) => res.json({ data: await service.update(pool, req.params.id, req.body, req.admin.id, req) }));
export const createValue = wrap(async (req, res) => res.status(201).json({ data: await service.createValue(pool, req.params.id, req.body, req.admin.id, req) }));
export const updateValue = wrap(async (req, res) => res.json({ data: await service.updateValue(pool, req.params.id, req.body, req.admin.id, req) }));
