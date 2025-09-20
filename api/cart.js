import express from "express";
const router = express.Router();
export default router;

import {
  createCart,
  addItemToCart,
  updateCartItemQuantity,
  deleteCartItem,
  getCartByUserId,
} from "#db/queries/cart";

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

router.use(requireUser);

// ------------------GET /cart -> return logged in user's cart

router.route("/").get(async (req, res, next) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    return res.status(200).send(cart);
  } catch (error) {
    return next(error);
  }
});

// ------------------POST /cart -> create new cart row if none exists for user--------------

router.route("/").post(requireBody(["userId"]), async (req, res, next) => {
  try {
    if (req.user.id !== req.body.userId) {
      console.log(req.user.id, req.body.userId);
      return res.status(403).send("You can only create a cart for yourself");
    }
    const existingCart = await getCartByUserId(req.body.userId);
    if (existingCart) {
      return res.status(400).send("Cart already exists for this user");
    }
    const newCart = await createCart(req.body.userId);
    return res.status(201).send(newCart);
  } catch (error) {
    return next(error);
  }
});

// -----------------------------POST /cart/items ->add a box to the cart---------------------------
// ----------------------------request body {box_type, pre_made_box_id, user_custom_box_id, quantity}

router
  .route("/items")
  .post(
    requireUser,
    requireBody(["cartId", "boxType", "boxId", "quantity"]),
    async (req, res, next) => {
      try {
        const cart = await getCartByUserId(req.user.id);
        if (!cart || cart.id !== req.body.cartId) {
          return res
            .status(403)
            .send("You can only add items to your own cart");
        }
        const newCartItem = await addItemToCart(
          req.body.cartId,
          req.body.boxType,
          req.body.boxId,
          req.body.quantity
        );
        return res.status(201).send(newCartItem);
      } catch (error) {
        return next(error);
      }
    }
  );

// ------------------PUT /cart/items/:id -> update the quantity of a box
// ------------------+1 or -1 in sql code-----------------------------

router
  .route("/items/:id")
  .put(
    requireUser,
    requireBody(["cartId", "action"]),
    async (req, res, next) => {
      try {
        const cart = await getCartByUserId(req.user.id);
        if (!cart || cart.id !== req.body.cartId) {
          return res
            .status(403)
            .send("You can only update items in your own cart");
        }
        const updatedCartItem = await updateCartItemQuantity(
          req.params.id,
          req.body.action
        );
        if (!updatedCartItem) {
          return res.status(404).send("Cart item not found");
        }
        return res.status(200).send(updatedCartItem);
      } catch (error) {
        return next(error);
      }
    }
  );

// ------------------DELETE /cart/items/:id -> Remove a box from the cart-----------------------------

router
  .route("/items/:id")
  .delete(requireUser, requireBody(["cartId"]), async (req, res, next) => {
    try {
      const cart = await getCartByUserId(req.user.id);
      if (!cart || cart.id !== req.body.cartId) {
        return res
          .status(403)
          .send("You can only delete items from your own cart");
      }
      const deleted = await deleteCartItem(req.params.id);
      if (!deleted) {
        return res.status(404).send("Cart item not found");
      }
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });
