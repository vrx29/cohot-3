//Middlewares
/*
Ques: app.use(express.json()) => we call express.json() function but in other cases we just pass functions to middleware?
Ans: because this function returns a function.

Ques: Why body needs explicit middleware although other req.headers, req.query doesn't need it.
Ans: Because we dont know what body can be it can be Text, JSON or XML

Ques: Input validation for inputs in API so server should not break
eg: input can be string, array, number or anything how would you check?
Use Zod to check input
 
If we send request to server with any random input it should not expose our server code/error to client.
-> use Global catches
app.use(function(err, req, res, next){
    res.json({
    msg: "Error occured"
    })
})

//
*/


// Authentication

const express = require('express');

const app = express()
