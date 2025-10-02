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

export const addOrderItem = async (orderId, boxType, boxId, quantity) => {
  try {
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
      return orderItem;
    }
  } catch (err) {
    if (err.code === "23505") {
      if (boxType === "pre-made") {
        const sql = `
        UPDATE order_items
        SET quantity = quantity + $3
        WHERE order_items.order_id = $1 AND order_items.pre_made_box_id = $2
        RETURNING *
        `;
        const {
          rows: [updatedOrderItem],
        } = await db.query(sql, [orderId, boxId, quantity]);
        return updatedOrderItem;
      }

      if (boxType === "custom") {
        const sql = `
        UPDATE order_items
        SET quantity = quantity + $3
        WHERE order_items.order_id = $1 AND order_items.user_custom_box_id = $2
        RETURNING *
        `;
        const {
          rows: [updatedOrderItem],
        } = await db.query(sql, [orderId, boxId, quantity]);
        return updatedOrderItem;
      }
    }
  }
};

export const getOrdersByUserId = async (userId) => {
  // used the split_part code from AI
  const sql = `
  SELECT 
    orders.id AS order_id, 
    orders.public_order_id,
    ('MB-' || UPPER(split_part(orders.public_order_id::text, '-', 1))) AS order_number,
    orders.status, 
    orders.total_price AS order_total, 
    orders.created_at,
    
    (SELECT COALESCE(SUM(order_items.quantity), 0)
      FROM order_items
      WHERE order_items.order_id = orders.id
    ) +
    (SELECT COALESCE(SUM(order_item_sauces.quantity), 0)
      FROM order_item_sauces
      WHERE order_item_sauces.order_id = orders.id
    ) +
    (SELECT COALESCE(SUM(order_item_extras.quantity), 0)
      FROM order_item_extras
      WHERE order_item_extras.order_id = orders.id
    ) AS total_item_count,

    (SELECT COALESCE(SUM(order_items.quantity), 0)
      FROM order_items
      WHERE order_items.order_id = orders.id
    ) AS box_count,

    (SELECT COALESCE(SUM(order_item_sauces.quantity), 0)
      FROM order_item_sauces
      WHERE order_item_sauces.order_id = orders.id
    ) AS sauce_count,

    (SELECT COALESCE(SUM(order_item_extras.quantity), 0)
      FROM order_item_extras
      WHERE order_item_extras.order_id = orders.id
    ) AS extra_count

  FROM orders
  WHERE orders.user_id = $1
  ORDER BY created_at DESC
  `;
  const { rows: orders } = await db.query(sql, [userId]);
  return orders;
};

export const getOrderByIdForUser = async (publicOrderId, userId) => {
  const sql = `
  SELECT 
    orders.id AS order_id,
    orders.public_order_id,
    ('MB-' || UPPER(split_part(orders.public_order_id::text, '-', 1))) AS order_number,
    orders.user_id,
    orders.status,
    orders.total_price,
    orders.created_at,

    (SELECT COALESCE(SUM(order_items.quantity), 0)
      FROM order_items
      WHERE order_items.order_id = orders.id
    ) +
    (SELECT COALESCE(SUM(order_item_sauces.quantity), 0)
      FROM order_item_sauces
      WHERE order_item_sauces.order_id = orders.id
    ) +
    (SELECT COALESCE(SUM(order_item_extras.quantity), 0)
      FROM order_item_extras
      WHERE order_item_extras.order_id = orders.id
    ) AS total_item_count,

    (SELECT COALESCE(SUM(order_items.quantity), 0)
      FROM order_items
      WHERE order_items.order_id = orders.id
    ) AS box_count,

    (SELECT COALESCE(SUM(order_item_sauces.quantity), 0)
      FROM order_item_sauces
      WHERE order_item_sauces.order_id = orders.id
    ) AS sauce_count,

    (SELECT COALESCE(SUM(order_item_extras.quantity), 0)
      FROM order_item_extras
      WHERE order_item_extras.order_id = orders.id
    ) AS extra_count,

    (SELECT COALESCE(json_agg(json_build_object(
      'order_item_id', order_items.id,
      'boxType', order_items.box_type,
      'quantity', order_items.quantity,
      'box_total',
        CASE
          WHEN order_items.box_type = 'pre-made' THEN 
            (SELECT 
              pre_made_boxes.price
            FROM 
              pre_made_boxes
            WHERE
              pre_made_boxes.id = order_items.pre_made_box_id
            ) * order_items.quantity

          WHEN order_items.box_type = 'custom' THEN
            (SELECT COALESCE(SUM(nigiris.price * user_custom_box_contents.quantity), 0)
            FROM
              user_custom_box_contents
            JOIN
              nigiris ON nigiris.id = user_custom_box_contents.nigiri_id
            WHERE
              user_custom_box_contents.user_custom_box_id = order_items.user_custom_box_id
            ) +
            (SELECT COALESCE(SUM(sauces.price * user_custom_box_sauces.quantity), 0)
            FROM
              user_custom_box_sauces
            JOIN
              sauces ON sauces.id = user_custom_box_sauces.sauce_id
            WHERE
              user_custom_box_sauces.user_custom_box_id = order_items.user_custom_box_id
            ) +
            (SELECT COALESCE(SUM(extras.price * user_custom_box_extras.quantity), 0)
            FROM
              user_custom_box_extras
            JOIN 
              extras ON extras.id = user_custom_box_extras.extra_id
            WHERE 
              user_custom_box_extras.user_custom_box_id = order_items.user_custom_box_id
            ) * order_items.quantity
            END,

      'box_details',
        CASE
          WHEN order_items.box_type = 'pre-made' THEN
            (SELECT json_build_object(
              'pre_made_box_id', pre_made_boxes.id,
              'name', pre_made_boxes.name,
              'description', pre_made_boxes.description,
              'image_url', pre_made_boxes.image_url,
              'price', pre_made_boxes.price,
              'nigiris', 
                (SELECT COALESCE(json_agg(json_build_object(
                  'pre_made_box_content_id', pre_made_box_contents.id,
                  'nigiri_id', nigiris.id,
                  'name', nigiris.name,
                  'category', nigiris.category,
                  'description', nigiris.description,
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
                )
            )
            FROM
              pre_made_boxes
            WHERE
              pre_made_boxes.id = order_items.pre_made_box_id
            )

          WHEN order_items.box_type = 'custom' THEN
            (SELECT json_build_object(
              'user_custom_box_id', user_custom_boxes.id,
              'user_id', user_custom_boxes.user_id,
              'nigiris',
                (SELECT COALESCE(json_agg(json_build_object(
                  'user_custom_box_content_id', user_custom_box_contents.id,
                  'nigiri_id', nigiris.id,
                  'name', nigiris.name,
                  'category', nigiris.category,
                  'description', nigiris.description,
                  'image_url', nigiris.image_url,
                  'price', nigiris.price,
                  'quantity', user_custom_box_contents.quantity
                )
                ORDER BY
                  user_custom_box_contents.id ASC
                ), '[]'
                )
                FROM
                  user_custom_box_contents
                JOIN
                  nigiris ON nigiris.id = user_custom_box_contents.nigiri_id
                WHERE
                  user_custom_box_contents.user_custom_box_id = user_custom_boxes.id
                ),

              'sauces',
                (SELECT COALESCE(json_agg(json_build_object(
                  'user_custom_box_sauce_id', user_custom_box_sauces.id,
                  'sauce_id', sauces.id,
                  'name', sauces.name,
                  'description', sauces.description,
                  'image_url', sauces.image_url,
                  'price', sauces.price
                )
                ORDER BY
                  user_custom_box_sauces.id ASC
                ), '[]'
                )
                FROM
                  user_custom_box_sauces
                JOIN
                  sauces ON sauces.id = user_custom_box_sauces.sauce_id
                WHERE
                  user_custom_box_sauces.user_custom_box_id = user_custom_boxes.id
                ),

              'extras',
                (SELECT COALESCE(json_agg(json_build_object(
                'user_custom_box_extra_id', user_custom_box_extras.id,
                'extra_id', extras.id,
                'name', extras.name,
                'description', extras.description,
                'image_url', extras.image_url,
                'price', extras.price
                )
                ORDER BY
                  user_custom_box_extras.id ASC
                ), '[]'
                )
                FROM
                  user_custom_box_extras
                JOIN
                  extras ON extras.id = user_custom_box_extras.extra_id
                WHERE
                  user_custom_box_extras.user_custom_box_id = user_custom_boxes.id
                )
            )
            FROM
              user_custom_boxes
            WHERE
              user_custom_boxes.id = order_items.user_custom_box_id
            )
          END
    )), '[]'
    )
    FROM
      order_items
    JOIN 
      orders ON orders.id = order_items.order_id
    WHERE
      order_items.order_id = orders.id
  ) AS items,

  (SELECT COALESCE(json_agg(json_build_object(
    'order_item_sauce_id', order_item_sauces.id,
    'quantity', order_item_sauces.quantity,
    'sauce_total',
      (SELECT 
        sauces.price
      FROM
        sauces
      WHERE
        sauces.id = order_item_sauces.sauce_id
      ) * order_item_sauces.quantity,
    'sauce',
      (SELECT json_build_object(
        'sauce_id', sauces.id,
        'name', sauces.name,
        'description', sauces.description,
        'image_url', sauces.image_url,
        'price', sauces.price
      )
      FROM
        sauces
      WHERE
        sauces.id = order_item_sauces.sauce_id
      )
  )
  ORDER BY
    order_item_sauces.id ASC        
  ), '[]'
  )
  FROM
    order_item_sauces
  WHERE
    order_item_sauces.order_id = orders.id
  ) AS sauces,

  (SELECT COALESCE(json_agg(json_build_object(
    'order_extra_item_id', order_item_extras.id,
    'quantity', order_item_extras.quantity,
    'extra_total',
      (SELECT 
        extras.price
      FROM
        extras
      WHERE
        extras.id = order_item_extras.extra_id
      ) * order_item_extras.quantity,
    'extra',
      (SELECT json_build_object(
        'extra_id', extras.id,
        'name', extras.name,
        'description', extras.description,
        'image_url', extras.image_url,
        'price', extras.price
      )
      FROM
        extras
      WHERE
        extras.id = order_item_extras.extra_id
      )
  )
  ORDER BY
    order_item_extras.id ASC    
  ), '[]'
  )
  FROM
    order_item_extras
  WHERE
    order_item_extras.order_id = orders.id
  ) AS extras
  

  FROM 
    orders 
  WHERE 
    orders.public_order_id = $1 AND orders.user_id = $2
  `;
  const {
    rows: [order],
  } = await db.query(sql, [publicOrderId, userId]);
  return order;
};

export const addOrderItemSauce = async (orderId, sauceId, quantity) => {
  try {
    const sql = `
    INSERT INTO order_item_sauces(order_id, sauce_id, quantity) 
    VALUES($1, $2, $3) 
    RETURNING *
    `;
    const {
      rows: [addSauceToOrder],
    } = await db.query(sql, [orderId, sauceId, quantity]);
    return addSauceToOrder;
  } catch (err) {
    if (err.code === "23505") {
      const sql = `
      UPDATE order_item_sauces
      SET quantity = quantity + $3
      WHERE order_item_sauces.order_id = $1 AND order_item_sauces.sauce_id = $2
      RETURNING *
      `;
      const {
        rows: [updateOrderItemSauceQuantity],
      } = await db.query(sql, [orderId, sauceId, quantity]);
      return updateOrderItemSauceQuantity;
    }
  }
};

export const addOrderItemExtra = async (orderId, extraId, quantity) => {
  try {
    const sql = `
    INSERT INTO order_item_extras(order_id, extra_id, quantity) 
    VALUES($1, $2, $3) 
    RETURNING *
    `;
    const {
      rows: [addExtraToOrder],
    } = await db.query(sql, [orderId, extraId, quantity]);
    return addExtraToOrder;
  } catch (err) {
    if (err.code === "23505") {
      const sql = `
      UPDATE order_item_extras
      SET quantity = quantity + $3
      WHERE order_item_extras.order_id = $1 AND order_item_extras.extra_id = $2
      RETURNING *
      `;
      const {
        rows: [updateOrderItemExtraQuantity],
      } = await db.query(sql, [orderId, extraId, quantity]);
      return updateOrderItemExtraQuantity;
    }
  }
};

// ---------------------------------------Update order status--------------------------------

// export const updateOrderStatus = async (orderId, status) => {
//   const validStatuses = ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

//   if (!validStatuses.includes(status)) {
//     throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
//   }

//   const sql = `
//   UPDATE orders
//   SET status = $1
//   WHERE id = $2
//   RETURNING *
//   `;
//   const {
//     rows: [order],
//   } = await db.query(sql, [status, orderId]);
//   return order;
// };

// ---------------------------------------------Cancel order (soft delete by updating status)---------------------------------

// export const cancelOrder = async (orderId) => {
//   const sql = `
//   UPDATE orders
//   SET status = 'cancelled'
//   WHERE id = $1
//   RETURNING *
//   `;
//   const {
//     rows: [order],
//   } = await db.query(sql, [orderId]);
//   return order;
// };

// --------------------------------------------------Hard delete order (removes from database completely)---------------------------------
// export const deleteOrder = async (orderId) => {
//   const sql = `
//   DELETE FROM orders
//   WHERE id = $1
//   RETURNING *
// >>>>>>> main
//   `;
//   const {
//     rows: [order],
//   } = await db.query(sql, [orderId]);
//   return order;
// };

// do not need these helpers

// export const addOrderItemNigiri = async (orderItemId, nigiriId, quantity) => {
//   const sql = `
//   INSERT INTO order_item_nigiris(order_item_id, nigiri_id, quantity)
//   VALUES($1, $2, $3)
//   RETURNING *
//   `;
//   const {
//     rows: [orderItemNigiri],
//   } = await db.query(sql, [orderItemId, nigiriId, quantity]);
//   return orderItemNigiri;
// };

// export const addOrderItemSauce = async (orderItemId, sauceId, quantity) => {
//   const sql = `
//   INSERT INTO order_item_sauces(order_item_id, sauce_id, quantity)
//   VALUES($1, $2, $3)
//   RETURNING *
//   `;
//   const {
//     rows: [orderItemSauce],
//   } = await db.query(sql, [orderItemId, sauceId, quantity]);
//   return orderItemSauce;
// };

// export const addOrderItemExtra = async (orderItemId, extraId, quantity) => {
//   const sql = `
//   INSERT INTO order_item_extras(order_item_id, extra_id, quantity)
//   VALUES($1, $2, $3)
//   RETURNING *
//   `;
//   const {
//     rows: [orderItemExtra],
//   } = await db.query(sql, [orderItemId, extraId, quantity]);
//   return orderItemExtra;
// };

// ---------------------------------------------------Clear cart after order is placed---------------------------------

// export const clearCartItems = async (cartId) => {
//   const sql = `
//   DELETE FROM cart_items
//   WHERE cart_id = $1
//   `;
//   await db.query(sql, [cartId]);
// };
