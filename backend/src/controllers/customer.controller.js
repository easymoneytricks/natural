import { pool } from "../config/database.js";
import { getProfile, updateProfile } from "../services/customer.service.js";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "../services/customerAddress.service.js";

export async function profile(req, res, next) {
  try {
    const customer = await getProfile(pool, req.customer.id);
    res.json({ data: { customer } });
  } catch (error) {
    next(error);
  }
}
export async function patchProfile(req, res, next) {
  try {
    const customer = await updateProfile(pool, req.customer.id, req.body);
    res.json({ data: { customer } });
  } catch (error) {
    next(error);
  }
}
export async function addresses(req, res, next) {
  try {
    res.json({ data: await listAddresses(pool, req.customer.id) });
  } catch (error) {
    next(error);
  }
}
export async function create(req, res, next) {
  try {
    res
      .status(201)
      .json({ data: await createAddress(pool, req.customer.id, req.body) });
  } catch (error) {
    next(error);
  }
}
export async function patch(req, res, next) {
  try {
    res.json({
      data: await updateAddress(pool, req.customer.id, req.params.id, req.body),
    });
  } catch (error) {
    next(error);
  }
}
export async function remove(req, res, next) {
  try {
    await deleteAddress(pool, req.customer.id, req.params.id);
    res.json({ data: { deleted: true } });
  } catch (error) {
    next(error);
  }
}
export async function makeDefault(req, res, next) {
  try {
    res.json({
      data: await setDefaultAddress(pool, req.customer.id, req.params.id),
    });
  } catch (error) {
    next(error);
  }
}
