import express from "express";
const router = express.Router();
export default router;

import {
  getAllPreMadeBoxes,
  getPreMadeBoxById,
} from "#db/queries/preMadeBoxes";

router.route("/").get(async (req, res) => {
  try {
    const preMadeBoxes = await getAllPreMadeBoxes();
    return res.status(200).send(preMadeBoxes);
  } catch (error) {
    return next(error);
  }
});

router.param("id", async (req, res, next, id) => {
  try {
    const preMadeBoxId = Number(id);
    if (!Number.isInteger(preMadeBoxId) || preMadeBoxId < 1)
      return res.status(400).send("Invalid pre-made box ID");

    const preMadeBox = await getPreMadeBoxById(preMadeBoxId);
    if (!preMadeBox) return res.status(404).send("Pre-Made-Box not found");

    req.preMadeBox = preMadeBox;
    next();
  } catch (error) {
    return next(error);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    res.status(200).send(req.preMadeBox);
  } catch (error) {
    return next(error);
  }
});
