import db from "#db/client";

export const createOrder = async (userId, totalPrice, status = 'placed') => {
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

//------------------------------------- Get all orders (admin only)-------------------------------------

export const getAllOrders = async () => {
  const sql = `
  SELECT * FROM orders ORDER BY created_at DESC
  `;
  const { rows: orders } = await db.query(sql);
  return orders;
};

// -----------------------------------Get single order by ID with full details------------------------------------

export const getOrderById = async (orderId) => {
  const sql = `
  SELECT 
    orders.id AS order_id,
    orders.user_id,
    orders.total_price,
    orders.status,
    orders.created_at,
    users.name AS user_name,
    users.email AS user_email,
    (SELECT json_agg(json_build_object(
      'order_item_id', order_items.id,
      'box_type', order_items.box_type,
      'quantity', order_items.quantity,
      'pre_made_box', 
        CASE 
          WHEN order_items.box_type = 'pre-made' THEN
            (SELECT json_build_object(
              'id', pre_made_boxes.id,
              'name', pre_made_boxes.name,
              'description', pre_made_boxes.description,
              'price', pre_made_boxes.price
            )
            FROM pre_made_boxes
            WHERE pre_made_boxes.id = order_items.pre_made_box_id
            )
        END,
      'custom_box',
        CASE
          WHEN order_items.box_type = 'custom' THEN
            (SELECT json_build_object(
              'id', user_custom_boxes.id,
              'nigiris', (
                SELECT json_agg(json_build_object(
                  'nigiri_id', order_item_nigiris.nigiri_id,
                  'name', nigiris.name,
                  'quantity', order_item_nigiris.quantity,
                  'price', nigiris.price
                ))
                FROM order_item_nigiris
                JOIN nigiris ON nigiris.id = order_item_nigiris.nigiri_id
                WHERE order_item_nigiris.order_item_id = order_items.id
              ),
              'sauces', (
                SELECT json_agg(json_build_object(
                  'sauce_id', order_item_sauces.sauce_id,
                  'name', sauces.name,
                  'quantity', order_item_sauces.quantity,
                  'price', sauces.price
                ))
                FROM order_item_sauces
                JOIN sauces ON sauces.id = order_item_sauces.sauce_id
                WHERE order_item_sauces.order_item_id = order_items.id
              ),
              'extras', (
                SELECT json_agg(json_build_object(
                  'extra_id', order_item_extras.extra_id,
                  'name', extras.name,
                  'quantity', order_item_extras.quantity,
                  'price', extras.price
                ))
                FROM order_item_extras
                JOIN extras ON extras.id = order_item_extras.extra_id
                WHERE order_item_extras.order_item_id = order_items.id
              )
            )
            FROM user_custom_boxes
            WHERE user_custom_boxes.id = order_items.user_custom_box_id
            )
        END
    ))
    FROM order_items
    WHERE order_items.order_id = orders.id
    ) AS items
  FROM orders
  JOIN users ON users.id = orders.user_id
  WHERE orders.id = $1
  `;
  const {
    rows: [order],
  } = await db.query(sql, [orderId]);
  return order;
};

// --------------------------------- Get orders by user ID----------------------------------

export const getOrdersByUserId = async (userId) => {
  const sql = `
  SELECT 
    orders.id AS order_id,
    orders.user_id,
    orders.total_price,
    orders.status,
    orders.created_at,
    (SELECT json_agg(json_build_object(
      'order_item_id', order_items.id,
      'box_type', order_items.box_type,
      'quantity', order_items.quantity,
      'pre_made_box', 
        CASE 
          WHEN order_items.box_type = 'pre-made' THEN
            (SELECT json_build_object(
              'id', pre_made_boxes.id,
              'name', pre_made_boxes.name,
              'description', pre_made_boxes.description,
              'price', pre_made_boxes.price
            )
            FROM pre_made_boxes
            WHERE pre_made_boxes.id = order_items.pre_made_box_id
            )
        END,
      'custom_box',
        CASE
          WHEN order_items.box_type = 'custom' THEN
            (SELECT json_build_object(
              'id', user_custom_boxes.id
            )
            FROM user_custom_boxes
            WHERE user_custom_boxes.id = order_items.user_custom_box_id
            )
        END
    ))
    FROM order_items
    WHERE order_items.order_id = orders.id
    ) AS items
  FROM orders
  WHERE orders.user_id = $1
  ORDER BY orders.created_at DESC
  `;
  const { rows: orders } = await db.query(sql, [userId]);
  return orders;
};

// ---------------------------------------Update order status--------------------------------

export const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  const sql = `
  UPDATE orders 
  SET status = $1 
  WHERE id = $2 
  RETURNING *
  `;
  const {
    rows: [order],
  } = await db.query(sql, [status, orderId]);
  return order;
};

// ---------------------------------------------Cancel order (soft delete by updating status)---------------------------------

export const cancelOrder = async (orderId) => {
  const sql = `
  UPDATE orders 
  SET status = 'cancelled' 
  WHERE id = $1 
  RETURNING *
  `;
  const {
    rows: [order],
  } = await db.query(sql, [orderId]);
  return order;
};

// --------------------------------------------------Hard delete order (removes from database completely)---------------------------------
export const deleteOrder = async (orderId) => {
  const sql = `
  DELETE FROM orders 
  WHERE id = $1 
  RETURNING *
  `;
  const {
    rows: [order],
  } = await db.query(sql, [orderId]);
  return order;
};

// ---------------------------------------------------Clear cart after order is placed---------------------------------

export const clearCartItems = async (cartId) => {
  const sql = `
  DELETE FROM cart_items 
  WHERE cart_id = $1
  `;
  await db.query(sql, [cartId]);
};