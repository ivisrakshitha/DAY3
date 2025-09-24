const User = require("../models/User");

//Method Post
//@desc Create User
//Access Public
const createUser = async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
};

//Methos get
//@desc Get all users
//Access Public
const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

module.exports = { createUser, getUsers };
