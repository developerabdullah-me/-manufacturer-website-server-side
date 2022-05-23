const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middelware
app.use(cors());
app.use(express.json());





app.get("/", (req, res) => {
    res.send("running parse go");
  });
  
  app.listen(port, () => {
    console.log("listen on port", port);
  });