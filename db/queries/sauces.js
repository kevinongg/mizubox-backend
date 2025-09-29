import db from "#db/client";

export const createSauce = async (name, description, imageUrl, price) => {
  const sql = `
  INSERT INTO sauces(name, description, image_url, price) 
  VALUES($1, $2, $3, $4) 
  RETURNING *
  `;
  const {
    rows: [sauce],
  } = await db.query(sql, [name, description, imageUrl, price]);
  return sauce;
};

export const getAllSauces = async () => {
  const sql = `
    SELECT * FROM sauces ORDER BY id
    `;
  const { rows: sauces } = await db.query(sql);
  return sauces;
};

export const getSauceById = async (id) => {
  const sql = `
  SELECT * FROM sauces WHERE id = $1
  `;
  const {
    rows: [sauce],
  } = await db.query(sql, [id]);
  return sauce;
};
