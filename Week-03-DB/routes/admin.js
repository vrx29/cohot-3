const express = require("express");
const router = express.Router();
const { Course, Admin, User } = require("../db");
const adminMiddleware = require("../middlewares/admin");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "TESTSECRET";

// Admin routes
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  await Admin.create({ username, password });
  res.json({ message: "Admin created successfully" });
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
console.log("INPUT : ", username, password)
  const user = await Admin.findOne({ username, password });
console.log(user)
  if (user) {
    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(411).json({
      msg: "Incorrect email and pass",
    });
  }
});

router.post("/courses", adminMiddleware, async (req, res) => {
  const { title, description, imageLink, price } = req.body;

  const newCourse = Course.create({
    title,
    description,
    imageLink,
    price,
  });

  res.json({
    message: "Course created successfully",
    courseId: newCourse._id,
  });
});

router.get("/courses", adminMiddleware, async (req, res) => {
  const data = await Course.find({});
  res.send({
    courses: data,
  });
});

module.exports = router;
