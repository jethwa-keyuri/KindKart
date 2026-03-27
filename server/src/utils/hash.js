import bcrypt from "bcrypt";
import config from "../config/config.js";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.bcrypt.saltRounds);
};

export const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};
