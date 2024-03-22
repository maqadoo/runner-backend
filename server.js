const express = require("express");
const app = express();
const dotenv = require("dotenv");
const routesUrls = require("./routes/routes");
const cors = require("cors");
const mongoose = require("mongoose");
// backend code
dotenv.config();


//used mongodb for database
mongoose.connect(
  process.env.NODE_ENV_DATABASE,
{ useNewUrlParser: true, useUnifiedTopology: true }
)
.then(()=>console.log("Connected to Database"))
.catch((err)=>console.log("Database connection failed"+err))



app.use(express.json());
app.use(cors());
app.use("/app", routesUrls);
app.listen(5000, () => console.log("Server is running..."));




