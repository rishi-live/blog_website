"use strict";
const express = require("express");
var compression = require("compression");
const dotEnv = require("dotenv");
const cors = require("cors");
const dbConnection = require("./database/connection");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");

const version = "v2";
dotEnv.config();
const app = express();

dbConnection();

// cors
app.use(cors());

// request payload middleware
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(express.urlencoded({ extended: true }));

app.use(compression());
// parse application/x-www-form-urlencoded

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
// parse application/json
app.use(bodyParser.json({ limit: "50mb" }));
// parse application/json

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been uploaded");
});

//all login
// app.use("/api/" + version + "/user", require("./routes/userLogin.routes"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/categories", require("./routes/categories"));

app.use("/uploads", express.static("./uploads"));
const PORT = process.env.PORT || 7009;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// error handler middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({
    status: 500,
    message: err.message,
    body: {},
  });
});
