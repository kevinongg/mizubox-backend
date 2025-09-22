import express from "express";
const router = express.Router();
export default router;

import { deleteAllCartItems, getCartByUserId } from "#db/queries/cart";
import {
  addOrderItem,
  createOrder,
  getOrdersByUserId,
} from "#db/queries/orders";

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

router.use(requireUser);

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const orders = await getOrdersByUserId(1);
      return res.status(200).send(orders);
    } catch (error) {
      return next(error);
    }
  })
  .post(async (req, res) => {});

router.route("/checkout").post(async (req, res) => {
  // get users cart
  const cart = await getCartByUserId(req.user.id);
  if (!cart || !cart.items || cart.items.length === 0)
    return res.status(400).send("Cart is empty");

  // create order
  const order = await createOrder(req.user.id, cart.cart_total);

  // add each cart item into order_items(cart.items)
  for (const item of cart.items) {
    await addOrderItem(order.id, item.boxType, item.box_details.box_id);
  }
  // clear cart
  await deleteAllCartItems(cart.cart_id);

  res.status(201).send("Order successfully placed");
});

// get /:id
