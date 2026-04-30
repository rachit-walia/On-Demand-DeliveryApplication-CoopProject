const express = require("express");
const auth    = require("../middleware/auth");
const C       = require("../controllers/index");

const user  = express.Router();
user.post("/register", C.register);
user.post("/login",    C.login);
user.get("/profile",   auth, C.getProfile);
user.put("/profile",   auth, C.updateProfile);

const rest  = express.Router();
rest.get("/",           C.getRestaurants);
rest.get("/cuisines",   C.getCuisines);
rest.get("/categories", C.getCategories);
rest.get("/search",     C.search);
rest.get("/:id",        C.getRestaurant);

const order = express.Router();
order.post("/",             auth, C.placeOrder);
order.get("/",              auth, C.getUserOrders);
order.get("/:id",           auth, C.getOrder);
order.put("/:id/cancel",    auth, C.cancelOrder);
order.get("/:id/reorder",   auth, C.reorder);

const offer = express.Router();
offer.get("/",          C.getOffers);
offer.post("/validate", C.validateCoupon);

const rider = express.Router();
rider.get("/",       C.getRiders);
rider.get("/route",  C.getRoute);
rider.get("/:id",    C.getRider);

const review = express.Router();
review.get("/:restaurantId", C.getReviews);
review.post("/", auth, C.addReview);

module.exports = { user, rest, order, offer, rider, review };
