import express from "express";
const router = express.Router();
export default router;

import {
  addExtraToUserCustomBox,
  addNigiriToUserCustomBox,
  addSauceToUserCustomBox,
  createUserCustomBox,
  getAllCustomBoxesByUserId,
  getUserCustomBoxById,
  updateUserCustomBoxExtraQuantity,
  updateUserCustomBoxNigiriQuantity,
  updateUserCustomBoxSauceQuantity,
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
      const userId = Number(req.body.userId);
      const userCustomBox = await createUserCustomBox(userId);
      return res.status(201).send(userCustomBox);
    } catch (error) {
      next(error);
    }
  });

router.param("id", async (req, res, next, id) => {
  try {
    const userCustomBox = await getUserCustomBoxById(Number(id));
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
  .post(requireBody(["nigiriId"]), async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id) {
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");
      }

      const nigiriId = Number(req.body.nigiriId);
      if (!Number.isInteger(nigiriId) || nigiriId < 0) {
        return res
          .status(400)
          .send("ID of a nigiri must be a positive integer");
      }

      const addNigiri = await addNigiriToUserCustomBox(
        req.userCustomBox.user_custom_box_id,
        nigiriId
      );
      return res.status(201).send(addNigiri);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:id/sauces")
  .post(requireBody(["sauceId"]), async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id) {
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");
      }

      const sauceId = Number(req.body.sauceId);
      if (!Number.isInteger(sauceId) || sauceId < 0) {
        return res.status(400).send("ID of a sauce must be a positive integer");
      }

      const addSauce = await addSauceToUserCustomBox(
        req.userCustomBox.user_custom_box_id,
        sauceId
      );
      return res.status(201).send(addSauce);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:id/extras")
  .post(requireBody(["extraId"]), async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id) {
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");
      }

      const extraId = Number(req.body.extraId);
      if (!Number.isInteger(extraId) || extraId < 0) {
        return res
          .status(400)
          .send("ID of an extra must be a positive integer");
      }

      const addExtra = await addExtraToUserCustomBox(
        req.userCustomBox.user_custom_box_id,
        extraId
      );
      return res.status(201).send(addExtra);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:id/nigiris/:nigiriId")
  .put(requireBody(["quantity"]), async (req, res) => {
    if (req.user.id !== req.userCustomBox.user_id) {
      return res
        .status(403)
        .send("You are not authorized to modify this custom box");
    }

    const nigiriId = Number(req.params.nigiriId);

    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).send("Quantity must be a positive integer");
    }

    const updatedNigiriQuantity = await updateUserCustomBoxNigiriQuantity(
      quantity,
      req.userCustomBox.user_custom_box_id,
      nigiriId
    );
    if (!updatedNigiriQuantity)
      return res.status(404).send("Nigiri not found in this custom box");

    return res.status(200).send(updatedNigiriQuantity);
  });

router
  .route("/:id/sauces/:sauceId")
  .put(requireBody(["quantity"]), async (req, res) => {
    if (req.user.id !== req.userCustomBox.user_id) {
      return res
        .status(403)
        .send("You are not authorized to modify this custom box");
    }

    const sauceId = Number(req.params.sauceId);

    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).send("Quantity must be a positive integer");
    }

    const updatedSauceQuantity = await updateUserCustomBoxSauceQuantity(
      quantity,
      req.userCustomBox.user_custom_box_id,
      sauceId
    );
    if (!updatedSauceQuantity)
      return res.status(404).send("Sauce not found in this custom box");

    return res.status(200).send(updatedSauceQuantity);
  });

router
  .route("/:id/extras/:extraId")
  .put(requireBody(["quantity"]), async (req, res) => {
    if (req.user.id !== req.userCustomBox.user_id) {
      return res
        .status(403)
        .send("You are not authorized to modify this custom box");
    }

    const extraId = Number(req.params.extraId);

    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).send("Quantity must be a positive integer");
    }

    const updatedExtraQuantity = await updateUserCustomBoxExtraQuantity(
      quantity,
      req.userCustomBox.user_custom_box_id,
      extraId
    );
    if (!updatedExtraQuantity)
      return res.status(404).send("Extra not found in this custom box");

    return res.status(200).send(updatedExtraQuantity);
  });
