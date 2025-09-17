import express from "express";
const router = express.Router();
export default router;

import { createToken } from "#utils/jwt";
import { createUser, getUserByEmailAndPassword } from "#db/queries/users";

import requireBody from "../middleware/requireBody.js";

// ----------------users register-------------
router
  .route("/register")
  .post(
    requireBody(["name", "email", "password", "role"]),
    async (req, res) => {
      const { name, email, password, role } = req.body;
      const user = await createUser(name, email, password, role);
      const token = createToken({ id: user.id });
      return res.status(201).send(token);
    }
  );

// ----------------users login-------------
router
  .route("/login")
  .post(requireBody(["email", "password"]), async (req, res) => {
    const { email, password } = req.body;
    const user = await getUserByEmailAndPassword(email, password);
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }
    const token = createToken({ id: user.id });
    return res.status(201).send(token);
  });

// ----------------users about me-------------
router.route("/me").get(async (req, res) => {});
