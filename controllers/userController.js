const mongoose = require("mongoose");
const User = require("../models/User");

// GET /api/users (pagination, filtering, sorting)
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: "i" };
    if (req.query.email)
      filter.email = { $regex: req.query.email, $options: "i" };
    if (req.query.minAge) filter.age = { $gte: parseInt(req.query.minAge) };
    if (req.query.maxAge)
      filter.age = { ...filter.age, $lte: parseInt(req.query.maxAge) };
    if (req.query.isActive !== undefined)
      filter.isActive = req.query.isActive === "true";

    const sort = {};
    if (req.query.sortBy) {
      const order = req.query.sortOrder === "desc" ? -1 : 1;
      sort[req.query.sortBy] = order;
    } else {
      sort.createdAt = -1;
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).select("-__v"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/stats
const getUserStats = async (req, res, next) => {
  try {
    const overviewAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          averageAge: { $avg: "$age" },
          minAge: { $min: "$age" },
          maxAge: { $max: "$age" },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
        },
      },
    ]);

    const ageDistribution = await User.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 30, 50, 65, 120],
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: overviewAgg[0] || {
          totalUsers: 0,
          averageAge: 0,
          minAge: 0,
          maxAge: 0,
          activeUsers: 0,
        },
        ageDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid user ID format");
    }

    const user = await User.findById(id).select("-__v");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        data: user,
      });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id (replace entire document)
const replaceUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid user ID format");
    }

    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      overwrite: true,
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id (partial)
const patchUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid user ID format");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid user ID format");
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  replaceUser,
  patchUser,
  deleteUser,
  getUserStats,
};
