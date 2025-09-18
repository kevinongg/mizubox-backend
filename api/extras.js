import express from "express";
const router = express.Router();
export default router;

import { getAllExtras } from "#db/queries/extras";

router.route("/").get(async (req, res, next) => {
  try {
    const extras = await getAllExtras();
    res.status(200).send(extras);
  } catch (error) {
    return next(error);
  }
});
