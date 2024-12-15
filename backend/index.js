const express = require("express");
const { connection } = require("./db");
const { userRouter } = require("./routes/users.routes");
const { courseRoute } = require("./routes/courses.route");
const { videoRoute } = require("./routes/videos.route");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path"); // Import for serving static files

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/users", userRouter);
app.use("/courses", courseRoute);
app.use("/videos", videoRoute);

// Token Regeneration Route
app.get("/regenerateToken", (req, res) => {
  const rToken = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = jwt.verify(rToken, "ARIVU");
    const token = jwt.sign(
      { userId: decoded.userId, user: decoded.user },
      "arivu",
      { expiresIn: "7d" }
    );
    res.status(201).json({ msg: "token created", token });
  } catch (err) {
    res.status(400).json({ msg: "not a valid Refresh Token" });
  }
});

// Root Route
app.get("/", (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to Educa's Backend" });
  } catch (err) {
    res.status(400).json({ message: "Some Error Occurred. Please Refresh" });
  }
});

// Serve React App (Add This Section)
const buildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(buildPath));

// Fallback Route for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start Server
app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log(`connected to db`);
    console.log(`connected to port ${process.env.port}`);
  } catch (error) {
    console.log(`error: ${error}`);
  }
});
