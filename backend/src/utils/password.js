import bcrypt from 'bcryptjs'

const WORK_FACTOR = 12

export const hashPassword = (password) => bcrypt.hash(password, WORK_FACTOR)
export const comparePassword = (password, hash) => bcrypt.compare(password, hash)
