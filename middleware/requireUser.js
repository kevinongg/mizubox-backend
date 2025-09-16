/** Requires a logged-in user **/
const requireUser = (req, res, next) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  next();
};
