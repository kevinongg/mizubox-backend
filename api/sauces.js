import express from "express";
const router = express.Router();
export default router;

import { getAllSauces } from "#db/queries/sauces";

router.route("/").get(async (req, res, next) => {
  try {
    const sauces = await getAllSauces();
    return res.status(200).send(sauces);
  } catch (error) {
    return next(error);
  }
});
