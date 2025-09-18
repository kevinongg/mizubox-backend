import db from "#db/client";

export const createNigiri = async (
  name,
  category,
  description,
  imageUrl,
  price,
  available = true
) => {
  const sql = `
  INSERT INTO nigiris(name, category, description, image_url, price, available) 
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
  `;
  const {
    rows: [nigiri],
  } = await db.query(sql, [
    name,
    category,
    description,
    imageUrl,
    price,
    available,
  ]);
  return nigiri;
};

export const getAllNigiris = async () => {
  const sql = `
  SELECT * FROM nigiris ORDER BY id
  `;
  const { rows: nigiris } = await db.query(sql);
  console.log(nigiris);
  return nigiris;
};

export const getNigiriById = async (id) => {
  const sql = `
  SELECT * FROM nigiris WHERE id = $1
  `;
  const {
    rows: [nigiri],
  } = await db.query(sql, [id]);
  return nigiri;
};
