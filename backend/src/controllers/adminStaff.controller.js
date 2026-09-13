import { pool } from "../config/database.js";
import * as service from "../services/adminStaff.service.js";

const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);

export const users = wrap(async (req, res) =>
  res.json({ data: await service.users(pool, req.query) }),
);
export const roles = wrap(async (req, res) =>
  res.json({ data: await service.roles(pool) }),
);
export const permissions = wrap(async (req, res) =>
  res.json({ data: await service.permissions(pool) }),
);
export const roleDetail = wrap(async (req, res) =>
  res.json({ data: await service.roleDetail(pool, req.params.id) }),
);
export const saveUser = wrap(async (req, res) =>
  res.json({
    data: await service.saveUser(
      pool,
      req.body,
      req.params.id,
      req.admin.id,
      req,
    ),
  }),
);
export const saveRole = wrap(async (req, res) =>
  res.json({
    data: await service.saveRole(
      pool,
      req.body,
      req.params.id,
      req.admin.id,
      req,
    ),
  }),
);
export const updateRolePermissions = wrap(async (req, res) =>
  res.json({
    data: await service.updateRolePermissions(
      pool,
      req.params.id,
      req.body.permissionIds,
      req.admin.id,
      req,
    ),
  }),
);
