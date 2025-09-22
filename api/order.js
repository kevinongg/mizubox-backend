import express from "express";
const router = express.Router();
export default router;

import { getOrdersByUserId } from "#db/queries/orders";

import requireUser from "#middleware/requireUser";

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
