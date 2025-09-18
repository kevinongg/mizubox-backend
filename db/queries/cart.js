import db from "#db/client";

export const createCart = async (userId) => {
  const sql = `
  INSERT INTO cart(user_id) VALUES($1) RETURNING *
  `;
  const {
    rows: [cart],
  } = await db.query(sql, [userId]);
  console.log(cart);
  return cart;
};

export const addItemToCart = async (cartId, boxType, boxId, quantity) => {
  if (boxType === "pre-made") {
    const sql = `
  INSERT INTO cart_items(cart_id, box_type, pre_made_box_id, quantity)
  VALUES($1, $2, $3, $4)
  RETURNING *
  `;
    const {
      rows: [cartItem],
    } = await db.query(sql, [cartId, boxType, boxId, quantity]);
    console.log(cartItem);
    return cartItem;
  }

  if (boxType === "custom") {
    const sql = `
    INSERT INTO cart_items(cart_id, box_type, user_custom_box_id, quantity) 
    VALUES($1, $2, $3, $4) 
    RETURNING *
    `;
    const {
      rows: [cartItem],
    } = await db.query(sql, [cartId, boxType, boxId, quantity]);
    console.log(cartItem);
    return cartItem;
  }
};
