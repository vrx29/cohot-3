const express = require("express")

const app = express();
let requestCount = 0;

app.use((req, res, next)=>{
    requestCount++;
    console.log(requestCount)
    next();
})
app.get("/", (req, res)=>{
    res.status(200).json({name: "John"})
})

app.post("/user", (req, res) => {
    res.status(200).json({msg: 'Created dummy user'})
})

app.get('/requestCount', (req, res) => {
    res.status(200).json({requestCount})
})

app.listen(3000, ()=> console.log("Server started"))