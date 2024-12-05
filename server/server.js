require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const crypto = require('crypto')
const multer = require('multer')

const auth = require('./routes/auth')
const profile = require('./routes/profile')
const thought = require('./routes/thought')
const forum = require('./routes/forum')
const util = require('./util')

// Setup app
const app = express()
app.use(express.json())
app.use(cookieParser());

// Set up multer
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
})

// Middleware to add nonce
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(32).toString('base64')
  next()
})

// Middleware to add CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'self'"],
        upgradeInsecureRequests: [],
      }
    }
  })
)

// Sanity
app.get("/api", auth.authenticate, (req, res) => {
  return res.status(200).json({ message: `You are logged in as ${req.username}` })
})

// Auth routes (public)
app.post("/api/register", auth.register)
app.post("/api/login", auth.login)

// Profile routes
app.get("/api/:username/profile", auth.authenticate, util.reqUserExists, profile.getProfile)
app.get("/api/:username/profile/pfp", auth.authenticate, util.reqUserExists, profile.getPfp)
app.get("/api/:username/profile/html", auth.authenticate, util.reqUserExists, profile.getHTML)
app.get("/api/:username/profile/css", auth.authenticate, util.reqUserExists, profile.getCSS)
app.post("/api/profile", auth.authenticate, profile.updateProfile)
app.post("/api/profile/pfp", auth.authenticate, upload.single("pfp"), profile.updatePfp)
app.post("/api/profile/html", auth.authenticate, profile.updateHTML)
app.post("/api/profile/css", auth.authenticate, profile.updateCSS)

// Thought routes
app.get("/api/:username/thought", auth.authenticate, util.reqUserExists, thought.getThoughts)
app.get("/api/:username/thought/:thoughtID", auth.authenticate, util.reqUserExists, thought.getThoughtByID)
app.post("/api/thought/create", auth.authenticate, thought.createThought)
app.post("/api/thought/update", auth.authenticate, thought.updateThought)
app.post("/api/thought/delete", auth.authenticate, thought.deleteThought)

// Forum routes
// TODO

app.listen(5000, () => { console.log("Server started on port 5000") })