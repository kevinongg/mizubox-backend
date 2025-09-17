import db from "#db/client";

export const createPreMadeBox = async (name, description, imageUrl, price) => {
  const sql = `
  INSERT INTO pre_made_boxes(name, description, image_url, price) 
  VALUES ($1, $2, $3, $4) 
  RETURNING *
  `;
  const {
    rows: [preMadeBox],
  } = await db.query(sql, [name, description, imageUrl, price]);
  return preMadeBox;
};

export const addNigiriToPreMadeBox = async (
  preMadeBoxId,
  nigiriId,
  quantity
) => {
  const sql = `
  INSERT INTO pre_made_box_contents(pre_made_box_id, nigiri_id, quantity) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const { rows: addNigiri } = await db.query(sql, [
    preMadeBoxId,
    nigiriId,
    quantity,
  ]);
  return addNigiri;
};
