const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const path = require("path");
const fs = require("fs");

dotenv.config();

// تحديث الاتصال بـ MongoDB
mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // لتجنب التحذيرات عن useFindAndModify
    useCreateIndex: true, // لضمان استخدام createIndexes بدلاً من ensureIndex
  },
  () => {
    console.log("Connected to MongoDB");
  }
);

// تأكد من وجود مجلد الصور
if (!fs.existsSync(path.join(__dirname, "public/images"))) {
  fs.mkdirSync(path.join(__dirname, "public/images"), { recursive: true });
}

app.use("/images", express.static(path.join(__dirname, "public/images")));

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error uploading file");
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

// بدء الخادم
app.listen(8800, () => {
  console.log(process.env.MONGO_URL )
  console.log("Backend server is running!");
});