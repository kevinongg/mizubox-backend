import express from "express";
const router = express.Router();
export default router;

import { getAllOrders } from "#db/queries/orders";

router.route("/").get(async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    return res.status(200).send(orders);
  } catch (error) {
    return next(error);
  }
});
