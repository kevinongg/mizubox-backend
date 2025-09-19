import express from "express";
const router = express.Router();
export default router;

import {
  addNigiriToUserCustomBox,
  createUserCustomBox,
  getAllCustomBoxesByUserId,
  getUserCustomBoxById,
} from "#db/queries/UserCustomBoxes";

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
router.use(requireUser);

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      const userCustomBoxes = await getAllCustomBoxesByUserId(req.user.id);
      return res.status(200).send(userCustomBoxes);
    } catch (error) {
      next(error);
    }
  })
  .post(requireBody(["userId"]), async (req, res, next) => {
    try {
      const { userId } = req.body;
      const userCustomBox = await createUserCustomBox(userId);
      return res.status(201).send(userCustomBox);
    } catch (error) {
      next(error);
    }
  });

router.param("id", async (req, res, next, id) => {
  try {
    const numId = Number(id);
    const userCustomBox = await getUserCustomBoxById(numId);
    console.log(userCustomBox);
    if (!userCustomBox)
      return res.status(404).send("User's custom box not found");
    req.userCustomBox = userCustomBox;
    next();
  } catch (error) {
    next(error);
  }
});

router.route("/:id").get(async (req, res, next) => {
  try {
    if (req.user.id !== req.userCustomBox.user_id) {
      return res
        .status(403)
        .send("You are not authorized to view this custom box");
    }
    res.status(200).send(req.userCustomBox);
  } catch (error) {
    next(error);
  }
});

router
  .route("/:id/nigiris")
  .post(requireBody(["nigiriId", "quantity"]), async (req, res, next) => {
    const { nigiriId, quantity } = req.body;
    const addNigiri = await addNigiriToUserCustomBox(
      req.userCustomBox.user_custom_box_id,
      nigiriId,
      quantity
    );
    return res.status(201).send(addNigiri);
  });
