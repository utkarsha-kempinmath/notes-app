const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Note = require("../models/Note");

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: use absolute root path
const rootDir = process.cwd();

// Static files
app.use(express.static(path.join(rootDir, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

/* ================= DATABASE ================= */

// Prevent multiple connections on serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      dbName: "NotesApp",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

/* ================= ROUTES ================= */

// Home – list all notes
app.get("/", async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.render("index", { files: notes });
});

// Create note
app.post("/create", async (req, res) => {
  try {
    await Note.create({
      title: req.body.title.trim(),
      content: req.body.details,
    });
    res.redirect("/");
  } catch (err) {
    console.error(err.message);
    res.redirect("/");
  }
});

// View single note
app.get("/files/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.redirect("/");

  res.render("show", { note });
});

// Edit page
app.get("/edit/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.redirect("/");

  res.render("edit", { note });
});

// Update note
app.post("/edit", async (req, res) => {
  try {
    await Note.findByIdAndUpdate(req.body.id, {
      title: req.body.newTitle,
      content: req.body.details,
    });
    res.redirect("/");
  } catch (err) {
    console.error(err.message);
    res.redirect("/");
  }
});

// Delete note
app.post("/delete/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

module.exports = app;
