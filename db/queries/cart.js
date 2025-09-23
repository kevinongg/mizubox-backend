import db from "#db/client";

// ------------------CART QUERIES-------------------------

// -------------------create cart for user --------------
export const createCart = async (userId) => {
  const sql = `
  INSERT INTO cart(user_id) VALUES($1) RETURNING *
  `;
  const {
    rows: [cart],
  } = await db.query(sql, [userId]);
  return cart;
};

// ------------------add item to cart ----------------------

export const addItemToCart = async (cartId, boxType, boxId) => {
  try {
    if (boxType === "pre-made") {
      const sql = `
    INSERT INTO cart_items(cart_id, box_type, pre_made_box_id)
    VALUES($1, $2, $3)
    RETURNING *
    `;
      const {
        rows: [cartItem],
      } = await db.query(sql, [cartId, boxType, boxId]);
      return cartItem;
    }

    if (boxType === "custom") {
      const sql = `
      INSERT INTO cart_items(cart_id, box_type, user_custom_box_id) 
      VALUES($1, $2, $3) 
      RETURNING *
      `;
      const {
        rows: [cartItem],
      } = await db.query(sql, [cartId, boxType, boxId]);
      return cartItem;
    }
  } catch (err) {
    // handle unique constraint violation. if the same box exists, increase quantity + 1
    if (err.code === "23505") {
      if (boxType === "pre-made") {
        const sql = `
        UPDATE cart_items
        SET quantity = quantity + 1
        WHERE cart_items.cart_id = $1 AND cart_items.pre_made_box_id = $2
        RETURNING *
        `;
        const {
          rows: [updatedCartItem],
        } = await db.query(sql, [cartId, boxId]);
        return updatedCartItem;
      }

      if (boxType === "custom") {
        const sql = `
        UPDATE cart_items
        SET quantity = quantity + 1
        WHERE cart_items.cart_id = $1 AND cart_items.user_custom_box_id = $2
        RETURNING *
        `;
        const {
          rows: [updatedCartItem],
        } = await db.query(sql, [cartId, boxId]);
        return updatedCartItem;
      }
    }
  }
};

// ------------------get cart by user id ----------------------

export const getCartByUserId = async (userId) => {
  const sql = `
  SELECT 
    cart.id AS cart_id,
    cart.user_id,
    (SELECT COALESCE(SUM(item_total), 0)
    FROM 
      (SELECT
        CASE
          WHEN cart_items.box_type = 'pre-made' THEN pre_made_boxes.price * cart_items.quantity
          WHEN cart_items.box_type = 'custom' THEN
            (
            (SELECT COALESCE(SUM(nigiris.price * user_custom_box_contents.quantity), 0)
              FROM
                user_custom_box_contents
              JOIN
                nigiris ON nigiris.id = user_custom_box_contents.nigiri_id
              WHERE
                user_custom_box_contents.user_custom_box_id = user_custom_boxes.id
            ) +
            (SELECT COALESCE(SUM(sauces.price * user_custom_box_sauces.quantity), 0)
              FROM
                user_custom_box_sauces
              JOIN
                sauces ON sauces.id = user_custom_box_sauces.sauce_id
              WHERE
                user_custom_box_sauces.user_custom_box_id = user_custom_boxes.id
              ) +
            (SELECT COALESCE(SUM(extras.price * user_custom_box_extras.quantity), 0)
              FROM
                user_custom_box_extras
              JOIN
                extras ON extras.id = user_custom_box_extras.extra_id
              WHERE
                user_custom_box_extras.user_custom_box_id = user_custom_boxes.id
            )
          ) * cart_items.quantity
        END AS item_total
      FROM
        cart_items
      LEFT JOIN
        pre_made_boxes ON pre_made_boxes.id = cart_items.pre_made_box_id
      LEFT JOIN
        user_custom_boxes ON user_custom_boxes.id = cart_items.user_custom_box_id
      WHERE
        cart_items.cart_id = cart.id
      ) sub
    ) AS cart_total,
    
    (SELECT COALESCE(json_agg(json_build_object(
      'cart_item_id', cart_items.id,
      'boxType', cart_items.box_type,
      'quantity', cart_items.quantity,
      'box_total',
        CASE
          WHEN cart_items.box_type = 'pre-made' THEN pre_made_boxes.price * cart_items.quantity
          WHEN cart_items.box_type = 'custom' THEN 
            (
            (SELECT COALESCE(SUM(nigiris.price * user_custom_box_contents.quantity), 0)
              FROM
                user_custom_box_contents
              JOIN
                nigiris ON nigiris.id = user_custom_box_contents.nigiri_id
              WHERE
                user_custom_box_contents.user_custom_box_id = user_custom_boxes.id
              ) +
            (SELECT COALESCE(SUM(sauces.price * user_custom_box_sauces.quantity), 0)
              FROM
                user_custom_box_sauces
              JOIN
                sauces ON sauces.id = user_custom_box_sauces.sauce_id
              WHERE
                user_custom_box_sauces.user_custom_box_id = user_custom_boxes.id
              ) + 
            (SELECT COALESCE(SUM(extras.price * user_custom_box_extras.quantity), 0)
              FROM
                user_custom_box_extras
              JOIN
                extras ON extras.id = user_custom_box_extras.extra_id
              WHERE
                user_custom_box_extras.user_custom_box_id = user_custom_boxes.id
              )
            ) * cart_items.quantity
          END,

      'box_details',
        CASE
          WHEN cart_items.box_type = 'pre-made' THEN
            (SELECT json_build_object(
              'box_id', pre_made_boxes.id,
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
            )


          WHEN cart_items.box_type = 'custom' THEN
            (SELECT json_build_object(
              'box_id', user_custom_boxes.id,
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
          )
          END
    )
    ORDER BY 
      cart_items.id ASC
    ), '[]'
    )
    FROM 
      cart_items
    LEFT JOIN
      pre_made_boxes ON pre_made_boxes.id = cart_items.pre_made_box_id
    LEFT JOIN
      user_custom_boxes ON user_custom_boxes.id = cart_items.user_custom_box_id
    WHERE 
      cart_items.cart_id = cart.id
    ) 
      AS items
  FROM 
    cart 
  WHERE 
    cart.user_id = $1
  `;
  const {
    rows: [cart],
  } = await db.query(sql, [userId]);
  return cart;
};

// ------------------update cart item quantity +1 or -1 ----------------------

export const updateCartItemQuantity = async (quantity, cartItemId) => {
  const sql = `
  UPDATE cart_items
  SET quantity = $1
  WHERE id = $2
  RETURNING *
  `;
  const {
    rows: [updatedCartItem],
  } = await db.query(sql, [quantity, cartItemId]);
  return updatedCartItem;
};

// ------------------get cartItem by user id ----------------------

export const getCartItemsByCartId = async (cart_id) => {
  const sql = `
  SELECT * FROM cart_items WHERE cart_id = $1
  `;
  const { rows: cartItems } = await db.query(sql, [cart_id]);
  return cartItems;
};

// ------------------delete cart item by user id ----------------------

export const deleteCartItem = async (cartItemId) => {
  const sql = `
  DELETE FROM cart_items WHERE id = $1 RETURNING *
  `;
  const {
    rows: [deletedCartItem],
  } = await db.query(sql, [cartItemId]);
  return deletedCartItem;
};

export const getCartItemById = async (id) => {
  const sql = `
  SELECT * FROM cart_items WHERE id = $1
  `;
  const {
    rows: [cartItem],
  } = await db.query(sql, [id]);
  return cartItem;
};

export const deleteAllCartItems = async (cartId) => {
  const sql = `
  DELETE FROM cart_items WHERE cart_id = $1 RETURNING*
  `;
  const { rows: deletedCart } = await db.query(sql, [cartId]);
  return deletedCart;
};
