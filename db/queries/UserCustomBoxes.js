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

export const addSauceToUserCustomBox = async (
  userCustomBoxId,
  sauceId,
  quantity
) => {
  const sql = `
  INSERT INTO user_custom_box_sauces(user_custom_box_id, sauce_id, quantity) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const {
    rows: [sauceToCustomBox],
  } = await db.query(sql, [userCustomBoxId, sauceId, quantity]);
  console.log(sauceToCustomBox);
  return sauceToCustomBox;
};

export const addExtraToUserCustomBox = async (
  userCustomBoxId,
  extraId,
  quantity
) => {
  const sql = `
  INSERT INTO user_custom_box_extras(user_custom_box_id, extra_id, quantity) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const {
    rows: [extraToCustomBox],
  } = await db.query(sql, [userCustomBoxId, extraId, quantity]);
  console.log(extraToCustomBox);
  return extraToCustomBox;
};
