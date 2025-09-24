const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { createUser, getUsers } = require("../controllers/userController");

//POST method
router.route("/").post(createUser);

//GET method

router.route("/").get(getUsers);

module.exports = router;
