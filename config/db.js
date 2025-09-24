const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Mongodb connected ${conn.connection.host}`);
  } catch {
    console.log("Error mongodb connection");
    process.exit(1);
  }
};

module.exports = connectDB;
