import express from "express";
const router = express.Router();
export default router;

import {
  createCart,
  addItemToCart,
  updateCartItemQuantity,
  deleteCartItem,
  getCartByUserId,
  getCartItemById,
} from "#db/queries/cart";

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

router.use(requireUser);

// ------------------GET /cart -> return logged in user's cart

router.route("/").get(async (req, res, next) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    if (!cart) return res.status(404).send("Cart not found for this user");
    return res.status(200).send(cart);
  } catch (error) {
    return next(error);
  }
});

// ------------------POST /cart -> create new cart row if none exists for user--------------

router.route("/").post(requireBody(["userId"]), async (req, res, next) => {
  try {
    const userId = Number(req.body.userId);
    if (req.user.id !== userId) {
      console.log(req.user.id, userId);
      return res.status(403).send("You can only create a cart for yourself");
    }

    const existingCart = await getCartByUserId(req.user.id);
    if (existingCart) {
      return res.status(400).send("Cart already exists for this user");
    }
    const newCart = await createCart(req.user.id);
    return res.status(201).send(newCart);
  } catch (error) {
    return next(error);
  }
});

// -----------------------------POST /cart/items ->add a box to the cart---------------------------
// ----------------------------request body {box_type, pre_made_box_id, user_custom_box_id, quantity}

router
  .route("/items")
  .post(requireBody(["boxType", "boxId"]), async (req, res, next) => {
    try {
      const cart = await getCartByUserId(req.user.id);
      if (!cart) return res.status(404).send("Cart not found for this user");

      if (req.user.id !== cart.user_id)
        return res.status(403).send("You can only add items to your own cart");

      const boxType = req.body.boxType;
      if (boxType !== "pre-made" && boxType !== "custom")
        return res.status(400).send("boxType must be 'premade' or 'cuustom'");

      const boxId = Number(req.body.boxId);
      if (!Number.isInteger(boxId) || boxId < 1)
        return res
          .status(400)
          .send("boxId must be a positive integer or more than 0");

      const newCartItem = await addItemToCart(
        cart.cart_id,
        req.body.boxType,
        boxId
      );

      return res.status(201).send(newCartItem);
    } catch (error) {
      return next(error);
    }
  });

// ------------------PUT /cart/items/:id -> update the quantity of a box
// ------------------+1 or -1 in sql code-----------------------------

router.param("id", async (req, res, next, id) => {
  const cart = await getCartByUserId(req.user.id);
  if (!cart) return res.status(404).send("Cart not found for this user");

  const cartItemId = Number(id);
  if (!Number.isInteger(cartItemId) || cartItemId < 1)
    return res.status(400).send("Invalid cart item ID");

  const cartItem = await getCartItemById(cartItemId);
  if (!cartItem)
    return res.status(404).send("Cart item not found for this user");

  req.cart = cart;
  req.cartItem = cartItem;
  req.cartItemId = cartItemId;
  next();
});

router
  .route("/items/:id")
  .put(requireBody(["quantity"]), async (req, res, next) => {
    try {
      if (req.cart.cart_id !== req.cartItem.cart_id)
        return res
          .status(403)
          .send("You can only modify items in your own cart");

      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res
          .status(400)
          .send("Quantity must be a positive integer or more than 0");

      const updatedCartItem = await updateCartItemQuantity(
        quantity,
        req.cartItemId
      );
      if (!updatedCartItem)
        return res.status(404).send("Cart item not found for this user");

      return res.status(200).send(updatedCartItem);
    } catch (error) {
      return next(error);
    }
  });

// ------------------DELETE /cart/items/:id -> Remove a box from the cart-----------------------------

router.route("/items/:id").delete(async (req, res, next) => {
  try {
    if (req.cart.cart_id !== req.cartItem.cart_id)
      return res.status(403).send("You can only delete items in your own cart");

    const deletedCartItem = await deleteCartItem(req.cartItemId);
    if (!deletedCartItem) return res.status(404).send("Cart item not found");

    return res.status(204).send(deletedCartItem);
  } catch (error) {
    return next(error);
  }
});
