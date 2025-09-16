import express from "express";
const app = express();
export default app;

import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "#api/users";

app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(getUserFromToken);

app.use("/users", userRoutes);

app.route("/").get((req, res) => {
  res.send("Welcome to JustTemaki API");
});

app.use(handlePostgresErrors);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("OH NO, SOMETHING WENT TERRIBLY WRONG :(");
});
