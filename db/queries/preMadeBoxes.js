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

export const getAllPreMadeBoxes = async () => {
  const sql = `
  SELECT * FROM pre_made_boxes ORDER BY id
  `;
  const { rows: preMadeBoxes } = await db.query(sql);
  return preMadeBoxes;
};

export const getPreMadeBoxById = async (id) => {
  const sql = `
  SELECT 
    pre_made_boxes.id AS pre_made_box_id,
    pre_made_boxes.name,
    pre_made_boxes.description,
    pre_made_boxes.image_url,
    pre_made_boxes.price,
    (SELECT COALESCE(json_agg(json_build_object(
      'pre_made_box_content_id', pre_made_box_contents.id,
      'nigiri_id', nigiris.id,
      'name', nigiris.name,
      'category', nigiris.category,
      'image_url', nigiris.image_url,
      'price', nigiris.price,
      'quantity', pre_made_box_contents.quantity
      ) 
      ORDER BY
        pre_made_box_contents.id ASC
      ), '[]'
      ) 
      FROM
        pre_made_box_contents
      JOIN 
        nigiris ON nigiris.id = pre_made_box_contents.nigiri_id
      WHERE
        pre_made_box_contents.pre_made_box_id = pre_made_boxes.id
      ) AS
          contents
  FROM
    pre_made_boxes
  WHERE
    pre_made_boxes.id = $1
  `;
  const {
    rows: [preMadeBox],
  } = await db.query(sql, [id]);
  return preMadeBox;
};
