import db from "#db/client";
import bcrypt from "bcrypt";

// Create a new user
export const createUser = async (name, email, password, role) => {
  const sql = `
  INSERT INTO 
  users(name, email, password_hash, role)
  VALUES ($1, $2, $3, $4)
  RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [name, email, hashedPassword, role]);
  return user;
};

// Get user by ID
export const getUserById = async (id) => {
  const sql = `
  SELECT * from users WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
};

// Get user by credentials (email and password)
export const getUserByEmailAndPassword = async (email, password) => {
  const sql = `
  SELECT * from users WHERE email = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [email]);
  if (!user) return null;
  const userExists = await bcrypt.compare(password, user.password_hash);
  if (!userExists) return null;
  return user;
};

export const getUserInfoByUserId = (userId) => {};
