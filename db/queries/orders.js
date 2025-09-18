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

export const addOrderItemBox = async (orderId, boxType, boxId, quantity) => {
  if (boxType === "pre-made") {
    const sql = `
    INSERT INTO order_items(order_id, box_type, pre_made_box_id, quantity) 
    VALUES($1, $2, $3, $4) 
    RETURNING *
    `;
    const {
      rows: [orderItemBox],
    } = await db.query(sql, [orderId, boxType, boxId, quantity]);
    return orderItemBox;
  }

  if (boxType === "custom") {
    const sql = `
    INSERT INTO order_items(order_id, box_type, user_custom_box_id, quantity) 
    VALUES($1, $2, $3, $4) 
    RETURNING *
    `;
    const {
      rows: [orderItemBox],
    } = await db.query(sql, [orderId, boxType, boxId, quantity]);
    return orderItemBox;
  }
};

export const addOrderItemNigiri = async (orderItemId, nigiriId, quantity) => {
  const sql = `
  INSERT INTO order_item_nigiris(order_item_id, nigiri_id, quantity) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const {
    rows: [orderItemNigiri],
  } = await db.query(sql, [orderItemId, nigiriId, quantity]);
  return orderItemNigiri;
};

export const addOrderItemSauce = async (orderItemId, sauceId, quantity) => {
  const sql = `
  INSERT INTO order_item_sauces(order_item_id, sauce_id, quantity) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const {
    rows: [orderItemSauce],
  } = await db.query(sql, [orderItemId, sauceId, quantity]);
  return orderItemSauce;
};

export const addOrderItemExtra = async (orderItemId, extraId, quantity) => {
  const sql = `
  INSERT INTO order_item_extras(order_item_id, extra_id, quantity) 
  VALUES($1, $2, $3) 
  RETURNING *
  `;
  const {
    rows: [orderItemExtra],
  } = await db.query(sql, [orderItemId, extraId, quantity]);
  return orderItemExtra;
};

export const getAllOrders = async (userId, totalPrice, status) => {
  const sql = `
  select * from orders
  `;
  const { rows: orders } = await db.query(sql);
  return orders;
};
