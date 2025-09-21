import express from "express";
const app = express();
export default app;

import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "#api/users";
import nigiriRoutes from "#api/nigiris";
import preMadeBoxRoutes from "#api/preMadeBoxes";
import sauceRoutes from "#api/sauces";
import extraRoutes from "#api/extras";
import userCustomBoxRoutes from "#api/UserCustomBoxes";
import orderRoutes from "#api/order";
import cartRoutes from "#api/cart";

app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(getUserFromToken);

app.use("/users", userRoutes);
app.use("/nigiris", nigiriRoutes);
app.use("/pre-made-boxes", preMadeBoxRoutes);
app.use("/sauces", sauceRoutes);
app.use("/extras", extraRoutes);
app.use("/user-custom-boxes", userCustomBoxRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

app.route("/").get((req, res) => {
  res.send("Welcome to MizuBox API");
});

app.use(handlePostgresErrors);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("OH NO, SOMETHING WENT TERRIBLY WRONG :(");
});

// ⚡️ Quick usage guide

// Use 200 when you’re returning data.

// Use 201 when you create something.

// Use 204 when you delete something.

// Use 400 for invalid input.

// Use 401/403 for auth issues.

// Use 404 when the thing doesn’t exist.

// Use 409 when it already exists (conflict).

// Use 422 when validation fails.

// Use 500+ if it’s your server’s fault.
