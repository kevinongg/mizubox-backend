import express from "express";
const router = express.Router();
export default router;

import { getAllExtras, getExtraById } from "#db/queries/extras";

router.route("/").get(async (req, res, next) => {
  try {
    const extras = await getAllExtras();
    res.status(200).send(extras);
  } catch (error) {
    return next(error);
  }
});

router.param("id", async (req, res, next, id) => {
  try {
    const extra = await getExtraById(Number(id));
    if (!extra) return res.status(404).send("Extra not found");
    req.extra = extra;
    next();
  } catch (error) {
    return next(error);
  }
});

router.route("/:id").get(async (req, res, next) => {
  try {
    return res.status(200).send(req.extra);
  } catch (error) {
    return next(error);
  }
});
