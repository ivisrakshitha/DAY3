const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 5001;

//connect DB
connectDB();

//Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ meassage: "hello, Server is running" });
});

//Routes
app.use("/api/users", require("./routes/userRoutes"));

app.listen(port, () => {
  console.log(`Sever running on port ${port}`);
});
