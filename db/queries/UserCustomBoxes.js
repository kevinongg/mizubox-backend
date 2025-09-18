import db from "#db/client";

export const createUserCustomBox = async (userId) => {
  const sql = `
  INSERT INTO user_custom_boxes(user_id) 
  VALUES($1) 
  RETURNING *
  `;
  const {
    rows: [customBox],
  } = await db.query(sql, [userId]);
  return customBox;
};

export const addNigiriToUserCustomBox = async (
  userCustomBoxId,
  nigiriId,
  quantity
) => {
  const sql = `
  INSERT INTO user_custom_box_contents(user_custom_box_id, nigiri_id, quantity) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const {
    rows: [nigiriToCustomBox],
  } = await db.query(sql, [userCustomBoxId, nigiriId, quantity]);
  return nigiriToCustomBox;
};
