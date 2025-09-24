const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  replaceUser,
  patchUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userController");

const router = express.Router();

// Put stats BEFORE :id so "stats" isn't treated as an id
router.get("/stats", getUserStats);

router.route("/").get(getUsers).post(createUser);

router
  .route("/:id")
  .get(getUserById)
  .put(replaceUser)
  .patch(patchUser)
  .delete(deleteUser);

module.exports = router;
