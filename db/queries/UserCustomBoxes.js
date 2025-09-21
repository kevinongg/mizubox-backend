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

export const addNigiriToUserCustomBox = async (userCustomBoxId, nigiriId) => {
  const sql = `
  INSERT INTO user_custom_box_contents(user_custom_box_id, nigiri_id) 
  VALUES($1, $2) 
  RETURNING *
  `;

  const {
    rows: [nigiriToCustomBox],
  } = await db.query(sql, [userCustomBoxId, nigiriId]);
  return nigiriToCustomBox;
};

export const addSauceToUserCustomBox = async (userCustomBoxId, sauceId) => {
  const sql = `
  INSERT INTO user_custom_box_sauces(user_custom_box_id, sauce_id) 
  VALUES($1, $2) 
  RETURNING *
  `;
  const {
    rows: [sauceToCustomBox],
  } = await db.query(sql, [userCustomBoxId, sauceId]);
  return sauceToCustomBox;
};

export const addExtraToUserCustomBox = async (userCustomBoxId, extraId) => {
  const sql = `
  INSERT INTO user_custom_box_extras(user_custom_box_id, extra_id) 
  VALUES($1, $2) 
  RETURNING *
  `;
  const {
    rows: [extraToCustomBox],
  } = await db.query(sql, [userCustomBoxId, extraId]);
  return extraToCustomBox;
};

export const getAllCustomBoxesByUserId = async (userId) => {
  const sql = `
  SELECT * FROM user_custom_boxes WHERE user_id = $1 ORDER BY created_at
  `;
  const { rows: customBoxes } = await db.query(sql, [userId]);
  return customBoxes;
};

export const getUserCustomBoxById = async (id) => {
  const sql = `
  SELECT 
    user_custom_boxes.id AS user_custom_box_id,
    user_id,
    (SELECT json_agg(json_build_object(
      'user_custom_box_content_id', user_custom_box_contents.id,
      'nigiri_id', nigiris.id,
      'name', nigiris.name,
      'category', nigiris.category,
      'image_url', nigiris.image_url,
      'price', nigiris.price,
      'quantity', user_custom_box_contents.quantity
      )) 
      FROM 
        user_custom_box_contents
      JOIN
        nigiris ON nigiris.id = user_custom_box_contents.nigiri_id
      WHERE
        user_custom_box_contents.user_custom_box_id = user_custom_boxes.id
      ) AS contents,

    (SELECT json_agg(json_build_object(
      'user_custom_box_sauce_id', user_custom_box_sauces.id,
      'sauce_id', sauces.id,
      'name', sauces.name,
      'description', sauces.description,
      'image_url', sauces.image_url,
      'price', sauces.price,
      'quantity', user_custom_box_sauces.quantity
      ))
      FROM
        user_custom_box_sauces
      JOIN
        sauces ON sauces.id = user_custom_box_sauces.sauce_id
      WHERE
        user_custom_box_sauces.user_custom_box_id = user_custom_boxes.id
      ) AS sauces,
    
    (SELECT json_agg(json_build_object(
      'user_custom_box_extra_id', user_custom_box_extras.id,
      'extra_id', user_custom_box_extras.extra_id,
      'name', extras.name,
      'description', extras.description,
      'image_url', extras.image_url,
      'price', extras.price,
      'quantity', user_custom_box_extras.quantity
      ))
      FROM
        user_custom_box_extras
      JOIN
        extras ON extras.id = user_custom_box_extras.extra_id
      WHERE
        user_custom_box_extras.user_custom_box_id = user_custom_boxes.id
      ) AS extras

  FROM 
    user_custom_boxes
  WHERE 
    user_custom_boxes.id = $1
  `;
  const {
    rows: [customBox],
  } = await db.query(sql, [id]);
  return customBox;
};

// update quantity of a nigiri inside a user's custom box
export const updateNigiriQuantityInUserCustomBox = async (
  quantity,
  userCustomBoxId,
  nigiriId
) => {
  const sql = `
  UPDATE user_custom_box_contents 
  SET quantity = $1 
  WHERE user_custom_box_id = $2 AND nigiri_id = $3 
  RETURNING *
  `;
  const {
    rows: [updatedNigiri],
  } = await db.query(sql, [quantity, userCustomBoxId, nigiriId]);
  return updatedNigiri;
};

export const updateSauceQuantityInUserCustomBox = async (
  quantity,
  userCustomBoxId,
  sauceId
) => {
  const sql = `
  UPDATE user_custom_box_sauces
  SET quantity = $1
  WHERE user_custom_box_id = $2 AND sauce_id = $3
  RETURNING *
  `;
  const {
    rows: [updatedSauce],
  } = await db.query(sql, [quantity, userCustomBoxId, sauceId]);
  return updatedSauce;
};

export const updateExtraQuantityInUserCustomBox = async (
  quantity,
  userCustomBoxId,
  extraId
) => {
  const sql = `
  UPDATE user_custom_box_extras
  SET quantity = $1
  WHERE user_custom_box_id = $2 AND extra_id = $3
  RETURNING *
  `;
  const {
    rows: [updatedExtra],
  } = await db.query(sql, [quantity, userCustomBoxId, extraId]);
  return updatedExtra;
};

export const deleteNigiriInUserCustomBox = async (
  userCustomBoxId,
  nigiriId
) => {
  const sql = `
  DELETE 
  FROM user_custom_box_contents
  WHERE user_custom_box_id = $1 AND nigiri_id = $2
  RETURNING *
  `;
  const {
    rows: [deletedNigiri],
  } = await db.query(sql, [userCustomBoxId, nigiriId]);
  return deletedNigiri;
};

export const deleteSauceInUserCustomBox = async (userCustomBoxId, sauceId) => {
  const sql = `
  DELETE 
  FROM user_custom_box_sauces
  WHERE user_custom_box_id = $1 AND sauce_id = $2
  RETURNING *
  `;
  const {
    rows: [deletedSauce],
  } = await db.query(sql, [userCustomBoxId, sauceId]);
  return deletedSauce;
};

export const deleteExtraInUserCustomBox = async (userCustomBoxId, extraId) => {
  const sql = `
  DELETE
  FROM user_custom_box_extras
  WHERE user_custom_box_id = $1 AND extra_id = $2
  RETURNING *
  `;
  const {
    rows: [deletedExtra],
  } = await db.query(sql, [userCustomBoxId, extraId]);
  return deletedExtra;
};
