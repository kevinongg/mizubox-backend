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
  clearAllCartItemsByUserId,
  getCartItemsByUserId,
  addSauceToCart,
  updateCartItemSauceQuantity,
  deleteCartItemSauceFromCart,
  addExtraToCart,
  updateCartItemExtraQuantity,
  deleteCartItemExtraFromCart,
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
  .get(async (req, res) => {
    const cartItems = await getCartItemsByUserId(req.user.id);
    if (!cartItems)
      return res.status(404).send("Cart items not found for this user");
    console.log(cartItems);
    res.status(200).send(cartItems);
  })
  .post(requireBody(["boxType", "boxId"]), async (req, res, next) => {
    try {
      const cart = await getCartByUserId(req.user.id);
      if (!cart) return res.status(404).send("Cart not found for this user");

      const cartItems = await getCartItemsByUserId(req.user.id);
      if (!cartItems)
        return res.status(404).send("Cart items not found for this user");

      if (req.user.id !== cart.user_id)
        return res.status(403).send("You can only add items to your own cart");

      // if (req.user.id !== item.user_id)
      //   return res
      //     .status(400)
      //     .send("You can only add boxes that you created yourself");

      const boxType = req.body.boxType;
      if (boxType !== "pre-made" && boxType !== "custom")
        return res.status(400).send("boxType must be 'premade' or 'custom'");

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
      console.error("Error adding item to cart");
      return next(error);
    }
  })
  // -----------------------------Clears Cart---------------------------
  .delete(async (req, res) => {
    const cart = await getCartByUserId(req.user.id);
    if (!cart) return res.status(404).send("Cart not found for this user");

    if (req.user.id !== cart.user_id)
      return res
        .status(403)
        .send("You can only add delete items in your own cart");

    const clearedCart = await clearAllCartItemsByUserId(req.user.id);
    return res.status(204).send(clearedCart);
  });

// -----------------------------POST /cart/sauces ->add a sauce to the cart---------------------------

router
  .route("/sauces")
  .post(requireBody(["sauceId"]), async (req, res, next) => {
    try {
      const cart = await getCartByUserId(req.user.id);
      if (!cart) return res.status(404).send("Cart not found for this user");

      if (req.user.id !== cart.user_id)
        return res.status(403).send("You can only add items to your own cart");

      const sauceId = Number(req.body.sauceId);
      if (!Number.isInteger(sauceId) || sauceId < 1)
        return res
          .status(400)
          .send("boxId must be a positive integer or more than 0");

      const addSauce = await addSauceToCart(cart.cart_id, sauceId);
      return res.status(201).send(addSauce);
    } catch (error) {
      return next(error);
    }
  });

// -----------------------------POST /cart/extras ->add an extra to the cart---------------------------

router
  .route("/extras")
  .post(requireBody(["extraId"]), async (req, res, next) => {
    try {
      const cart = await getCartByUserId(req.user.id);
      if (!cart) return res.status(404).send("Cart not found for this user");

      if (req.user.id !== cart.user_id)
        return res.status(403).send("You can only add items to your own cart");

      const extraId = Number(req.body.extraId);
      if (!Number.isInteger(extraId) || extraId < 1)
        return res
          .status(400)
          .send("boxId must be a positive integer or more than 0");

      const addExtra = await addExtraToCart(cart.cart_id, extraId);
      return res.status(201).send(addExtra);
    } catch (error) {
      return next(error);
    }
  });

// ------------------PUT /cart/items/:id -> update the quantity of a box
// ------------------+1 or -1 in sql code-----------------------------

router.param("id", async (req, res, next, id) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    if (!cart) return res.status(404).send("Cart not found for this user");

    const cartItemId = Number(id);
    if (!Number.isInteger(cartItemId) || cartItemId < 1)
      return res.status(400).send("Invalid cart item ID");

    const cartItem = await getCartItemById(cartItemId);
    if (!cartItem)
      return res.status(404).send("Cart item not found for this user");

    if (cart.cart_id !== cartItem.cart_id)
      return res.status(403).send("You can only modify items in your own cart");

    req.cart = cart;
    req.cartItem = cartItem;
    req.cartItemId = cartItemId;

    next();
  } catch (error) {
    next(error);
  }
});

router.param("sauceId", async (req, res, next, sauceId) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    if (!cart) return res.status(404).send("Cart not found for this user");

    if (cart.user_id !== req.user.id)
      return res.status(403).send("You can only modify items in your own cart");

    const cartItemSauceId = Number(sauceId);
    if (!Number.isInteger(cartItemSauceId) || cartItemSauceId < 1)
      return res.status(400).send("Invalid cart item sauce ID");

    req.cart = cart;
    req.cartItemSauceId = cartItemSauceId;
    next();
  } catch (error) {
    return next(error);
  }
});

router.param("extraId", async (req, res, next, extraId) => {
  try {
    const cart = await getCartByUserId(req.user.id);
    if (!cart) return res.status(404).send("Cart not found for this user");

    if (cart.user_id !== req.user.id)
      return res.status(403).send("You can only modify items in your own cart");

    const cartItemExtraId = Number(extraId);
    if (!Number.isInteger(cartItemExtraId) || cartItemExtraId < 1)
      return res.status(400).send("Invalid cart item sauce ID");

    req.cart = cart;
    req.cartItemExtraId = cartItemExtraId;
    next();
  } catch (error) {
    return next(error);
  }
});

router
  .route("/items/:id")
  .put(requireBody(["quantity"]), async (req, res, next) => {
    try {
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
        return res.status(404).send("Box not found in this cart");

      return res.status(200).send(updatedCartItem);
    } catch (error) {
      return next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const deletedCartItem = await deleteCartItem(req.cartItemId);
      if (!deletedCartItem) return res.status(404).send("Cart item not found");

      return res.status(204).send(deletedCartItem);
    } catch (error) {
      return next(error);
    }
  });

router
  .route("/sauces/:sauceId")
  .put(requireBody(["quantity"]), async (req, res, next) => {
    try {
      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res
          .status(400)
          .send("Quantity must be a positive integer or more than 0");

      const updatedCartItemSauce = await updateCartItemSauceQuantity(
        quantity,
        req.cartItemSauceId
      );
      if (!updatedCartItemSauce)
        return res.status(404).send("Sauce not found in this cart");

      return res.status(200).send(updatedCartItemSauce);
    } catch (error) {
      return next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const deletedCartItemSauce = await deleteCartItemSauceFromCart(
        req.cartItemSauceId
      );
      if (!deletedCartItemSauce) return res.status(404).send("Sauce not found");

      return res.status(204).send(deletedCartItemSauce);
    } catch (error) {
      return next(error);
    }
  });

router
  .route("/extras/:extraId")
  .put(requireBody(["quantity"]), async (req, res, next) => {
    try {
      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res
          .status(400)
          .send("Quantity must be a positive integer or more than 0");

      const updatedCartItemExtra = await updateCartItemExtraQuantity(
        quantity,
        req.cartItemExtraId
      );
      if (!updatedCartItemExtra)
        return res.status(404).send("Sauce not found in this cart");

      return res.status(200).send(updatedCartItemExtra);
    } catch (error) {
      return next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const deletedCartItemExtra = await deleteCartItemExtraFromCart(
        req.cartItemExtraId
      );
      if (!deletedCartItemExtra) return res.status(404).send("Sauce not found");

      return res.status(204).send(deletedCartItemExtra);
    } catch (error) {
      return next(error);
    }
  });
