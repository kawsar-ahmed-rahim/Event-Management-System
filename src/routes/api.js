const express = require("express");
const userController = require("../controllers/userController.js");
const eventController = require("../controllers/eventController.js");
const middlewares = require("../middlewares/authVerification.js");
let router = express.Router();

//! User
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user", middlewares, userController.user);
router.get("/logout", middlewares, userController.logout);
router.put("/update", middlewares, userController.update);


//! event
router.post(
  "/create-event",
  middlewares,
  eventController.createEvent
);
router.get("/all-event/:pageNo/:perPage", eventController.allEvent);

router.get("/single-event/:id", eventController.singleEvent);
router.put(
  "/update-event/:id",
  middlewares,
  eventController.updateEvent
);
router.delete(
  "/delete-event/:id",
  middlewares,
  eventController.deleteEvent
);

module.exports = router;
