import express from "express";
const router = express.Router();
export default router;

import { getAllNigiris, getNigiriById } from "#db/queries/nigiris";

router.route("/").get(async (req, res, next) => {
  try {
    const nigiris = await getAllNigiris();
    return res.status(200).send(nigiris);
  } catch (error) {
    return next(error);
  }
});

router.param("id", async (req, res, next, id) => {
  try {
    const nigiri = await getNigiriById(Number(id));
    if (!nigiri) return res.status(404).send("Nigiri not found");

    const nigiriId = Number(id);
    if (!Number.isInteger(nigiriId) || nigiriId < 1)
      return res.status(400).send("Invalid nigiri ID");

    req.nigiri = nigiri;
    next();
  } catch (error) {
    return next(error);
  }
});

router.route("/:id").get(async (req, res, next) => {
  try {
    res.status(200).send(req.nigiri);
  } catch (error) {
    return next(error);
  }
});
