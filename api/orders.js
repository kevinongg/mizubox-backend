import express from "express";
const router = express.Router();
export default router;

import {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  addOrderItemBox,
  addOrderItemNigiri,
  addOrderItemSauce,
  addOrderItemExtra,
  clearCartItems,
} from "#db/queries/orders";

import { getCartByUserId } from "#db/queries/cart";

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

// ----------------GET /orders -> Get all orders (admin only)----------------
router.route("/").get(requireUser, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      // If not admin, return only their orders
      const userOrders = await getOrdersByUserId(req.user.id);
      return res.status(200).send(userOrders);
    }

    const orders = await getAllOrders();
    return res.status(200).send(orders);
  } catch (error) {
    return next(error);
  }
});

// ----------------POST /orders -> Create new order from cart----------------
router
  .route("/")
  .post(requireUser, requireBody(["totalPrice"]), async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { totalPrice } = req.body;

      const cart = await getCartByUserId(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).send("Cart is empty");
      }

      const order = await createOrder(userId, totalPrice, "placed");

      for (const cartItem of cart.items) {
        const boxDetails = cartItem.box_details?.[0];
        if (!boxDetails) continue;

        const orderItem = await addOrderItemBox(
          order.id,
          cartItem.boxType,
          cartItem.boxType === "pre-made"
            ? boxDetails.pre_made_box_id
            : boxDetails.user_custom_box_id,
          cartItem.quantity
        );

        if (cartItem.boxType === "custom") {
          if (boxDetails.nigiris) {
            for (const nigiri of boxDetails.nigiris) {
              await addOrderItemNigiri(
                orderItem.id,
                nigiri.nigiri_id,
                nigiri.quantity
              );
            }
          }

          // Add sauces
          if (boxDetails.sauces) {
            for (const sauce of boxDetails.sauces) {
              await addOrderItemSauce(
                orderItem.id,
                sauce.sauce_id,
                sauce.quantity || 1
              );
            }
          }

          // Add extras
          if (boxDetails.extras) {
            for (const extra of boxDetails.extras) {
              await addOrderItemExtra(
                orderItem.id,
                extra.extra_id,
                extra.quantity || 1
              );
            }
          }
        }
      }

      await clearCartItems(cart.cart_id);

      const completeOrder = await getOrderById(order.id);

      return res.status(201).send(completeOrder);
    } catch (error) {
      return next(error);
    }
  });

//---------------------------------------------- Middleware to get order and check ownership----------------------------------

router.param("id", async (req, res, next, id) => {
  try {
    const orderId = Number(id);
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (req.user.id !== order.user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .send("You are not authorized to access this order");
    }

    req.order = order;
    next();
  } catch (error) {
    next(error);
  }
});

// ----------------GET /orders/:id -> Get specific order details----------------

router.
route("/:id").get(requireUser, async (req, res, next) => {
  try {
    return res.status(200).send(req.order);
  } catch (error) {
    return next(error);
  }
});

// ----------------PATCH /orders/:id/status -> Update order status----------------
router
  .route("/:id/status")
  .patch(requireUser, requireBody(["status"]), async (req, res, next) => {
    try {
      const { status } = req.body;

      if (req.user.role !== "admin") {
        if (status === "cancelled" && req.order.user_id === req.user.id) {
          if (!["placed", "confirmed"].includes(req.order.status)) {
            return res
              .status(400)
              .send("Order cannot be cancelled at this stage");
          }
        } else {
          return res
            .status(403)
            .send("You are not authorized to update order status");
        }
      }

      const updatedOrder = await updateOrderStatus(req.order.order_id, status);
      return res.status(200).send(updatedOrder);
    } catch (error) {
      if (error.message.includes("Invalid status")) {
        return res.status(400).send(error.message);
      }
      return next(error);
    }
  });

// ----------------DELETE /orders/:id -> Cancel order----------------

router.
route("/:id").delete(requireUser, async (req, res, next) => {
  try {
    if (!["placed", "confirmed"].includes(req.order.status)) {
      return res.status(400).send("Order cannot be cancelled at this stage");
    }

    if (req.user.id !== req.order.user_id && req.user.role !== "admin") {
      return res
        .status(403)
        .send("You are not authorized to cancel this order");
    }

    const cancelledOrder = await cancelOrder(req.order.order_id);

    return res.status(200).send({
      message: "Order cancelled successfully",
      order: cancelledOrder,
    });
  } catch (error) {
    return next(error);
  }
});

// ----------------DELETE /orders/:id/hard -> Permanently delete order (admin only)----------------

router.
route("/:id/hard").delete(requireUser, async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .send("Only administrators can permanently delete orders");
    }

    const deletedOrder = await deleteOrder(req.order.order_id);

    return res.status(200).send({
      message: "Order permanently deleted",
      order: deletedOrder,
    });
  } catch (error) {
    return next(error);
  }
});
