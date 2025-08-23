//ENV
const dotENV = require("dotenv");
dotENV.config();

const express = require("express");
const router = require("./src/routes/api");


//security middleware
const ratelimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Database MongoDB
const mongoose = require("mongoose");

const app = new express();

//security middleware implements
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
// app.use(xss());
app.use(hpp());
app.use(cors());
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb"}));

// Database connect

let url = "mongodb+srv://kawsarrahim1512:ycTzbhqp1jkHr43e@rahim.tboosus.mongodb.net/rahim"

let option = {
    user:process.env.DB_USER,
    user:process.env.DB_PASSWORD,
    autoIndex:true,
    serverSelectionTimeoutMS: 50000
};

mongoose.connect(url)
.then((res) => {
    console.log("database connected.");
    
}).catch((err) => {
    console.log(err);
    
});


// Request rate limit
let limiter = ratelimit({
     windowMs: 15 * 60 * 1000,
     max: 100,
 });
app.use(limiter);

//default API router
app.use("/api/v1", router)

app.use(express.static('client'));
app.use("/api/v1/get-file", express.static('uploads'));

// Undefined Router
app.use("*",(req, res)=>{
     res.status(404).json({ status: "404", data: "Not found"});   
 });
console.log("📍 Applying /api/v1 routes");


module.exports = app;