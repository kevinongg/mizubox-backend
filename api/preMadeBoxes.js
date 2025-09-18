import express from "express";
const router = express.Router();
export default router;

import {
  getAllPreMadeBoxes,
  getPreMadeBoxById,
} from "#db/queries/preMadeBoxes";

router.route("/").get(async (req, res) => {
  const preMadeBoxes = await getAllPreMadeBoxes();
  return res.status(200).send(preMadeBoxes);
});

router.param("id", async (req, res, next, id) => {
  try {
    const numId = Number(id);
    const preMadeBox = await getPreMadeBoxById(numId);
    if (!preMadeBox) return res.status(404).send("Pre-Made-Box not found");
    req.preMadeBox = preMadeBox;
    next();
  } catch (error) {
    return next(error);
  }
});

router.route("/:id").get(async (req, res) => {
  res.status(200).send(req.preMadeBox);
});
