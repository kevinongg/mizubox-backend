import { getOrCreateCartByUserId } from "#db/queries/cart";

const attachCart = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).send("User not authenticated");
    }
    req.cart = await getOrCreateCartByUserId(req.user.id);
  } catch (error) {
    next(error);
  }
};

export default attachCart;
