import db from "#db/client";

export const createExtra = async (name, description, imageUrl, price) => {
  const sql = `
  INSERT INTO extras(name, description, image_url, price) 
  VALUES($1, $2, $3, $4) 
  RETURNING *
  `;
  const {
    rows: [extra],
  } = await db.query(sql, [name, description, imageUrl, price]);
  return extra;
};
