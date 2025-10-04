import express from "express";
const router = express.Router();
export default router;

import { createToken } from "#utils/jwt";
import {
  createUser,
  getUserByEmailAndPassword,
  getUserById,
  getUserInfoByUserId,
  updateUserAccountById,
  updateUserPasswordByUserId,
} from "#db/queries/users";

import bcrypt from "bcrypt";
import requireBody from "../middleware/requireBody.js";
import requireUser from "../middleware/requireUser.js";
// ----------------users register-------------
router
  .route("/register")
  .post(requireBody(["name", "email", "password"]), async (req, res) => {
    const { name, email, password } = req.body;
    const user = await createUser(name, email, password);
    const token = createToken({ id: user.id });
    return res.status(201).send(token);
  });

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
    return res.status(200).send(token);
  });

// ----------------users about me-------------
router
  .route("/me")
  .get(requireUser, async (req, res, next) => {
    try {
      const user = await getUserInfoByUserId(req.user.id);
      if (!user) return res.status(404).send("User not found");
      res.status(200).send(user);
    } catch (error) {
      return next(error);
    }
  })
  .patch(requireUser, async (req, res, next) => {
    try {
      const { name, email, address, mobile_number } = req.body;
      if (!name && !email && !address && !mobile_number)
        return res
          .status(400)
          .json({ message: "At least one field must be provided" });

      const updatedUser = await updateUserAccountById(req.user.id, {
        name,
        email,
        address,
        mobile_number,
      });
      return res.status(200).send(updatedUser);
    } catch (error) {
      return next(error);
    }
  });

router.route("/me/password").patch(requireUser, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res
      .status(400)
      .json({ message: "Current and new password are both required." });

  if (newPassword.length < 8)
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters." });

  const user = await getUserById(req.user.id);
  const doesPasswordMatch = await bcrypt.compare(
    currentPassword,
    user.password_hash
  );
  if (!doesPasswordMatch)
    return res.status(401).json({ message: "Incorrect Password" });

  const updatedUserPassword = await updateUserPasswordByUserId(
    req.user.id,
    newPassword
  );
  return res.status(200).send(updatedUserPassword);
});
