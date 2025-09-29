import express from "express";
const router = express.Router();
export default router;

import { getAllSauces, getSauceById } from "#db/queries/sauces";

router.route("/").get(async (req, res, next) => {
  try {
    const sauces = await getAllSauces();
    return res.status(200).send(sauces);
  } catch (error) {
    return next(error);
  }
});

router.param("id", async (req, res, next, id) => {
  try {
    const sauceId = Number(id);
    if (!Number.isInteger(sauceId) || sauceId < 1)
      return res.status(400).send("Invalid sauce ID");

    const sauce = await getSauceById(sauceId);
    if (!sauce) return res.status(404).send("Sauce not found");

    req.sauce = sauce;
    next();
  } catch (error) {
    return next(error);
  }
});

router.route("/:id").get(async (req, res, next) => {
  try {
    return res.status(200).send(req.sauce);
  } catch (error) {
    return next(error);
  }
});
