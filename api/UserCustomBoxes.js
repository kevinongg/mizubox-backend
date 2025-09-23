import express from "express";
const router = express.Router();
export default router;

import {
  addExtraToUserCustomBox,
  addNigiriToUserCustomBox,
  addSauceToUserCustomBox,
  createUserCustomBox,
  deleteExtraInUserCustomBox,
  deleteNigiriInUserCustomBox,
  deleteSauceInUserCustomBox,
  getAllCustomBoxesByUserId,
  getUserCustomBoxById,
  updateExtraQuantityInUserCustomBox,
  updateNigiriQuantityInUserCustomBox,
  updateSauceQuantityInUserCustomBox,
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

    const customBoxId = Number(id);
    if (!Number.isInteger(customBoxId) || customBoxId < 1)
      return res.status(400).send("Invalid custom box ID");

    next();
  } catch (error) {
    next(error);
  }
});

router.route("/:id").get(async (req, res, next) => {
  try {
    if (req.user.id !== req.userCustomBox.user_id)
      return res
        .status(403)
        .send("You are not authorized to view this custom box");

    res.status(200).send(req.userCustomBox);
  } catch (error) {
    next(error);
  }
});

router
  .route("/:id/nigiris")
  .post(requireBody(["nigiriId"]), async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");

      const nigiriId = Number(req.body.nigiriId);
      if (!Number.isInteger(nigiriId) || nigiriId < 0)
        return res
          .status(400)
          .send("ID of a nigiri must be a positive integer");

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
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");

      const sauceId = Number(req.body.sauceId);
      if (!Number.isInteger(sauceId) || sauceId < 0)
        return res.status(400).send("ID of a sauce must be a positive integer");

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
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");

      const extraId = Number(req.body.extraId);
      if (!Number.isInteger(extraId) || extraId < 0)
        return res
          .status(400)
          .send("ID of an extra must be a positive integer");

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
  .put(requireBody(["quantity"]), async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");

      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res
          .status(400)
          .send("Quantity must be a positive integer or more than 0");

      const updatedNigiriQuantity = await updateNigiriQuantityInUserCustomBox(
        quantity,
        req.userCustomBox.user_custom_box_id,
        Number(req.params.nigiriId)
      );
      if (!updatedNigiriQuantity)
        return res.status(404).send("Nigiri not found in this custom box");

      return res.status(200).send(updatedNigiriQuantity);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to delete nigiris in this custom box");

      const deletedNigiri = await deleteNigiriInUserCustomBox(
        req.userCustomBox.user_custom_box_id,
        Number(req.params.nigiriId)
      );
      if (!deletedNigiri)
        return res.status(404).send("Nigiri not found in this custom box");

      return res.status(204).send(deletedNigiri);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:id/sauces/:sauceId")
  .put(requireBody(["quantity"]), async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");

      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res
          .status(400)
          .send("Quantity must be a positive integer or more than 0");

      const updatedSauceQuantity = await updateSauceQuantityInUserCustomBox(
        quantity,
        req.userCustomBox.user_custom_box_id,
        Number(req.params.sauceId)
      );
      if (!updatedSauceQuantity)
        return res.status(404).send("Sauce not found in this custom box");

      return res.status(200).send(updatedSauceQuantity);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to delete sauces in this custom box");

      const deletedSauce = await deleteSauceInUserCustomBox(
        req.userCustomBox.user_custom_box_id,
        Number(req.params.sauceId)
      );
      if (!deletedSauce)
        return res.status(404).send("Sauce not found in this custom box");

      return res.status(204).send(deletedSauce);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/:id/extras/:extraId")
  .put(requireBody(["quantity"]), async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to modify this custom box");

      const quantity = Number(req.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res
          .status(400)
          .send("Quantity must be a positive integer or more than 0");

      const updatedExtraQuantity = await updateExtraQuantityInUserCustomBox(
        quantity,
        req.userCustomBox.user_custom_box_id,
        Number(req.params.extraId)
      );
      if (!updatedExtraQuantity)
        return res.status(404).send("Extra not found in this custom box");

      return res.status(200).send(updatedExtraQuantity);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      if (req.user.id !== req.userCustomBox.user_id)
        return res
          .status(403)
          .send("You are not authorized to delete extras in this custom box");

      const deletedExtra = await deleteExtraInUserCustomBox(
        req.userCustomBox.user_custom_box_id,
        Number(req.params.extraId)
      );
      if (!deletedExtra)
        return res.status(404).send("Extra not found in this custom box");

      return res.status(204).send(deletedExtra);
    } catch (error) {
      next(error);
    }
  });
