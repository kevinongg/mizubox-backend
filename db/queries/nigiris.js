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
