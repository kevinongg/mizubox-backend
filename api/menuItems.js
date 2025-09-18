import express from "express";
const router = express.Router();
export default router;
import {
    getAllNigiris,
    getNigiriById,
    getAllPreMadeBoxes,
    getPreMadeBoxById,
    getAllSauces,
    getAllExtras
} from "#db/queries/menuitems"; 

// ----------------menu items get all nigiris-------------

router
  .route("/nigiris")
  .get(async (req, res, next) => {
    try {
      const nigiris = await getAllNigiris();
      res.status(200).send(nigiris);
    } catch (error) {
      return next(error);
    }
  });

// ----------------menu items get all nigiris by id -------------

router
  .route("/nigiris/:id")
  .get(async (req, res, next) => {
    try {
      const { id } = req.params;
      const nigiri = await getNigiriById(id);
      if (!nigiri) return res.status(404).send("Nigiri not found");
      res.status(200).send(nigiri);
    }
    catch (error) {
      return next(error);
    }
  });

// ----------------get pre-made boxes-------------

router
    .route("/preMadeBoxes")
    .get(async (req, res, next) => {
        try {
            const preMadeBoxes = await getAllPreMadeBoxes();
            res.status(200).send(preMadeBoxes);
        } catch (error) {
            return next(error);
        }
    });

// ----------------get pre-made boxes by id -------------

router
    .route("/preMadeBoxes/:id")
    .get(async (req, res, next) => {
        try {
            const { id } = req.params;
            const preMadeBox = await getPreMadeBoxById(id);
            if (!preMadeBox) return res.status(404).send("Pre-made box not found");
            res.status(200).send(preMadeBox);
        }
        catch (error) {
            return next(error);
        }
    });

// ----------------get all sauces-------------

router
    .route("/sauces")
    .get(async (req, res, next) => {
        try {
            const sauces = await getAllSauces();
            res.status(200).send(sauces);
        } catch (error) {
            return next(error);
        }
    });

// ----------------get all extras-------------

router
    .route("/extras")
    .get(async (req, res, next) => {
        try {
            const extras = await getAllExtras();
            res.status(200).send(extras);
        } catch (error) {
            return next(error);
        }
    });