const express = require("express");
const { User, Course } = require("../db");
const userMiddleware = require("../middlewares/user");
const router = express.Router();
const jwt = require("jsonwebtoken");

const JWT_SECRET = "TESTSECRET";

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  await User.create({ username, password });
  res.json({ message: "User created successfully" });
});

router.post("/signin", async (req, res) => {
   const { username, password } = req.body;

   const user = await User.find({username, password});
   if(user){
    const token = jwt.sign({username}, JWT_SECRET);
    res.json({token})
   } else{
    res.status(411).json({msg: 
        "Incorrect email or password"
    })
   }
})
router.get("/courses", userMiddleware, async (req, res) =>{
    const courses = Course.find({});
    res.json({
        courses
    })
})

router.post("/courses/:courseId", userMiddleware, async (req, res) =>{
    const courseId = req.params.courseId;
    const username = req.headers.username;

    await User.updateOne({username}, {
        "$push": {
            purchasedCourses: courseId
        }
    })

    res.json({message: "Purchase done"});
})

router.get("/purchasedCourses", userMiddleware, async (req, res) =>{
    const user = await User.findOne({username: req.headers.username})
    console.log(user.purchasedCourses);
    const courses = await Course.find({
        _id: {
            "$in": user.purchasedCourses
        }
    })

    res.json({courses})
})

module.exports = router;