import db from "#db/client";

export const createOrder = async (userId, totalPrice) => {
  const sql = `
  INSERT INTO orders(user_id, total_price) 
  VALUES($1, $2) 
  RETURNING *
  `;
  const {
    rows: [order],
  } = await db.query(sql, [userId, totalPrice]);
  return order;
};

export const addOrderItem = async (orderId, boxType, boxId) => {
  if (boxType === "pre-made") {
    const sql = `
    INSERT INTO order_items(order_id, box_type, pre_made_box_id) 
    VALUES($1, $2, $3) 
    RETURNING *
    `;
    const {
      rows: [orderItem],
    } = await db.query(sql, [orderId, boxType, boxId]);
    return orderItem;
  }

  if (boxType === "custom") {
    const sql = `
    INSERT INTO order_items(order_id, box_type, user_custom_box_id) 
    VALUES($1, $2, $3) 
    RETURNING *
    `;
    const {
      rows: [orderItem],
    } = await db.query(sql, [orderId, boxType, boxId]);
    return orderItem;
  }

  // handle unique constraint violation. if the same box exists, increase quantity + 1
  if (err.code === "23505") {
    if (boxType === "pre-made") {
      const sql = `
      UPDATE order_items
      SET quantity = quantity + 1
      WHERE order_items.order_id = $1 AND order_items.pre_made_box_id = $2
      RETURNING *
      `;
      const {
        rows: [updatedOrderItem],
      } = await db.query(sql, [orderId, boxId]);
      return updatedOrderItem;
    }

    if (boxType === "custom") {
      const sql = `
      UPDATE order_items
      SET quantity = quantity + 1
      WHERE order_items.order_id = $1 AND order_items.user_custom_box_id = $2
      RETURNING *
      `;
      const {
        rows: [updatedOrderItem],
      } = await db.query(sql, [orderId, boxId]);
      return updatedOrderItem;
    }
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

export const getOrdersByUserId = async (userId) => {
  const sql = `
  SELECT * FROM orders WHERE orders.user_id = $1 ORDER BY created_at DESC
  `;
  const { rows: orders } = await db.query(sql, [userId]);
  return orders;
};

export const getOrderById = async (orderId) => {
  const sql = `
  SELECT 
    orders.id AS order_id,
    orders.user_id,
    orders.total_price,
    orders.created_at,
    (SELECT json_agg(json_build_object(
      'order_item_id', order_items.id,
      'boxType', order_items.box_type,
      'quantity', order_items.quantity,
      'order_details',
        CASE
          WHEN order_items.box_type = 'pre-made' THEN
            (SELECT json_agg(json_build_object(
              'pre_made_box_id', pre_made_boxes.id,
              'name', pre_made_boxes.name,
              'description', pre_made_boxes.description,
              'image_url', pre_made_boxes.image_url,
              'price', pre_made_boxes.price,
              'nigiris', 
                (SELECT json_agg(json_build_object(
                  'pre_made_box_content_id', pre_made_box_contents.id,
                  'nigiri_id', nigiris.id,
                  'name', nigiris.name,
                  'category', nigiris.category,
                  'description', nigiris.description,
                  'image_url', nigiris.image_url,
                  'price', nigiris.price,
                  'quantity', pre_made_box_contents.quantity
                ))
                FROM
                  pre_made_box_contents
                JOIN
                  nigiris ON nigiris.id = pre_made_box_contents.nigiri_id
                WHERE
                  pre_made_box_contents.pre_made_box_id = pre_made_boxes.id
                )
            ))
            FROM
              pre_made_boxes
            WHERE
              pre_made_boxes.id = order_items.pre_made_box_id
            )
          WHEN order_items.box_type = 'custom' THEN
            (SELECT json_agg(json_build_object(
              'user_custom_box_id', user_custom_boxes.id,
              'user_id', user_custom_boxes.user_id,
              'nigiris',
                (SELECT json_agg(json_build_object(
                  'user_custom_box_content_id', user_custom_boxes.id,
                  'nigiri_id', nigiris.id,
                  'name', nigiris.name,
                  'category', nigiris.category,
                  'description', nigiris.description,
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
                ),
              'sauces',
                (SELECT json_agg(json_build_object(
                  'user_custom_box_sauce_id', user_custom_box_sauces.id,
                  'sauce_id', sauces.id,
                  'name', sauces.name,
                  'description', sauces.description,
                  'image_url', sauces.image_url,
                  'price', sauces.price
                ))
                FROM
                  user_custom_box_sauces
                JOIN
                  sauces ON sauces.id = user_custom_box_sauces.sauce_id
                WHERE
                  user_custom_box_sauces.user_custom_box_id = user_custom_boxes.id
                ),
              'extras',
                (SELECT json_agg(json_build_object(
                'user_custom_box_extra_id', user_custom_box_extras.id,
                'extra_id', extras.id,
                'name', extras.name,
                'description', extras.description,
                'image_url', extras.image_url,
                'price', extras.price
                ))
                FROM
                  user_custom_box_extras
                JOIN
                  extras ON extras.id = user_custom_box_extras.extra_id
                WHERE
                  user_custom_box_extras.user_custom_box_id = user_custom_boxes.id
                )
            ))
            FROM
              user_custom_boxes
            WHERE
              user_custom_boxes.id = order_items.user_custom_box_id
            )
          END
    ))
    FROM
      order_items
    WHERE
      order_items.order_id = orders.id
  ) AS items
  FROM 
    orders 
  WHERE 
    orders.user_id = $1
  `;
  const {
    rows: [order],
  } = await db.query(sql, [orderId]);
  return order;
};
