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

const express = require("express");

const app = express();

app.use(express.json());

app.get("/user-health", (req, res) => {
  res.json({
    msg: "User is healthy",
  });
});

app.listen(3000, () => console.log("Server started on port : 3000"));

// Authentication
// 3 Types
// 1. Hashing
/*
Hashing converts data into a fixed-length string using a one-way function.
Input → password
Output → random-looking string called hash

Password: mypassword123
Hash:
9b74c9897bac770ffc029102a200c5de

Its one way we cannot convert hash back to original data. Used for storing passwords in hash.

-----------------------------------------
2. Encryption
converts data into unreadable form but can be reversed
Plain Text -> Encryption -> Cipher Text
Cipher Text -> Decryption -> Plain Text

Its two way and requires key to decrypt.
used in RSA, HTTPS, TLS

------------------------------------------
3. JWT
HEADER.PAYLOAD.SIGNATURE


*/