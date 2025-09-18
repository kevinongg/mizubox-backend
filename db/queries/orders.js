import db from "#db/client";

export const createOrder = async (userId, totalPrice, status) => {
  const sql = `
  INSERT INTO orders(user_id, total_price, status) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const {
    rows: [order],
  } = await db.query(sql, [userId, totalPrice, status]);
  return order;
};

export const addItemToOrder = async (orderId, boxType, boxId, quantity) => {
  if (boxType === "pre-made") {
    const sql = `
    INSERT INTO order_items(order_id, box_type, pre_made_box_id, quantity) 
    VALUES($1, $2, $3, $4) 
    RETURNING *
    `;
    const {
      rows: [orderItem],
    } = await db.query(sql, [orderId, boxType, boxId, quantity]);
    return orderItem;
  }

  if (boxType === "custom") {
    const sql = `
    INSERT INTO order_items(order_id, box_type, user_custom_box_id, quantity) 
    VALUES($1, $2, $3, $4) 
    RETURNING *
    `;
    const {
      rows: [orderItem],
    } = await db.query(sql, [orderId, boxType, boxId, quantity]);
    console.log(orderItem);
    return orderItem;
  }
};
