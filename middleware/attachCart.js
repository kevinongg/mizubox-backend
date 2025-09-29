import { getOrCreateCartByUserId } from "#db/queries/cart";

const attachCart = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).send("User not authenticated");
    }
    req.cart = await getOrCreateCartByUserId(req.user.id);
    return next();
  } catch (error) {
    console.error(error);
    return res.status(404).send("Cart not found for this user");
  }
};

export default attachCart;
