import db from "#db/client";
import bcrypt from "bcrypt";

// Create a new user
export const createUser = async (name, email, password) => {
  const sql = `
  INSERT INTO 
  users(name, email, password_hash)
  VALUES ($1, $2, $3)
  RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [name, email, hashedPassword]);
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

export const getUserInfoByUserId = async (userId) => {
  const sql = `
  SELECT 
    id AS user_id,
    name,
    email,
    address,
    mobile_number,
    role
  FROM 
    users
  WHERE
    id = $1
  `;
  const {
    rows: [userInfo],
  } = await db.query(sql, [userId]);
  return userInfo;
};

export const updateUserAccountById = async (
  userId,
  { name, email, address, mobile_number }
) => {
  const sql = `
  UPDATE users
  SET 
    name = COALESCE($1, name),
    email = COALESCE($2, email),
    address = COALESCE($3, address),
    mobile_number = COALESCE($4, mobile_number)
  WHERE
    id = $5
  RETURNING 
    id AS user_id,
    name,
    email,
    address,
    mobile_number,
    role
  `;
  const { rows: updatedUser } = await db.query(sql, [
    name,
    email,
    address,
    mobile_number,
    userId,
  ]);
  return updatedUser;
};

export const updateUserPasswordByUserId = async (userId, newPassword) => {
  const sql = `
  UPDATE users
  SET password_hash = $2
  WHERE id = $1
  RETURNING *
  `;

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const {
    rows: [updatedHashedPassword],
  } = await db.query(sql, [userId, hashedPassword]);
  return updatedHashedPassword;
};

// export const getUserInfoByUserId = async (userId) => {
//   const sql = `
//   SELECT
//     users.id AS user_id,
//     users.name,
//     users.email,
//     users.role,
//     (SELECT json_agg(json_build_object(
//       'custom_box_id', user_custom_boxes.id,
//       'created_at', user_custom_boxes.created_at
//     )) FROM
//         user_custom_boxes
//     WHERE
//         user_custom_boxes.user_id = users.id
//     ) AS custom_boxes,
//     (SELECT json_agg(json_build_object(
//       'order_id', orders.id,
//       'total_price', orders.total_price,
//       'status', orders.status,
//       'created_at', orders.created_at
//     )) FROM
//         orders
//     WHERE
//         orders.user_id = users.id
//     ) AS orders
//   FROM
//     users
//   WHERE
//     users.id = $1
//   `;
//   const {
//     rows: [user],
//   } = await db.query(sql, [userId]);
//   return user;
// };
