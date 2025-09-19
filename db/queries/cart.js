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
    return cartItem;
  }
};

// ------------------get cart by user id ----------------------

export const getCartByUserId = async (userId) => {
  const sql = `
  SELECT * FROM cart WHERE user_id = $1
  `;
  const {
    rows: [cart],
  } = await db.query(sql, [userId]);
  return cart;
};

// ------------------update cart item quantity +1 or -1 ----------------------

export const updateCartItemQuantity = async (cartItemId, action) => {
  const sql = `
  UPDATE cart_items
  SET quantity = CASE
    WHEN $2 = 'increment' THEN quantity + 1
    WHEN $2 = 'decrement' THEN GREATEST(quantity - 1, 0)
    ELSE quantity
  END
  WHERE id = $1
  RETURNING *
  `;
  const {
    rows: [updatedCartItem],
  } = await db.query(sql, [cartItemId, action]);
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
