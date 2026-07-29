import User from "../models/user.model";

const findByEmail = (email: string) => User.findOne({ email: email.toLowerCase() });

const create = (data: { email: string; password: string }) => User.create(data);

export default {
  findByEmail,
  create,
};