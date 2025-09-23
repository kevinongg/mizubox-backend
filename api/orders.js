import express from "express";
const router = express.Router();
export default router;

import { deleteAllCartItems, getCartByUserId } from "#db/queries/cart";
import {
  addOrderItem,
  createOrder,
  getOrderById,
  getOrdersByUserId,
} from "#db/queries/orders";

import requireUser from "#middleware/requireUser";

router.use(requireUser);

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const orders = await getOrdersByUserId(req.user.id);
      if (!orders) return res.status(404).send("Orders not found");
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

router.param("id", async (req, res, next, id) => {
  const order = await getOrderById(Number(id));
  if (!order) return res.status(404).send("Order not found");

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId < 1)
    return res.status(400).send("Invalid order ID");

  req.order = order;
  next();
});

router.route("/:id").get(async (req, res) => {
  if (req.user.id !== req.order.user_id)
    return res.status(403).send("You are not authorized to view this order");
  res.status(200).send(req.order);
});
