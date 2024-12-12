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
const update = require('./routes/update')
const friend = require('./routes/friend')
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
app.get("/api/profile/:username/", auth.authenticate, util.reqUserExists, profile.getProfile)
app.get("/api/profile/:username/pfp", auth.authenticate, util.reqUserExists, profile.getPfp)
app.get("/api/profile/:username/html", auth.authenticate, util.reqUserExists, profile.getHTML)
app.get("/api/profile/:username/css", auth.authenticate, util.reqUserExists, profile.getCSS)
app.post("/api/profile", auth.authenticate, profile.updateProfile)
app.post("/api/profile/pfp", auth.authenticate, upload.single("pfp"), profile.updatePfp)
app.post("/api/profile/html", auth.authenticate, profile.updateHTML)
app.post("/api/profile/css", auth.authenticate, profile.updateCSS)

// Thought routes
app.get("/api/thought/:username", auth.authenticate, util.reqUserExists, thought.getThoughts)
app.get("/api/thought/:username/:thoughtID", auth.authenticate, util.reqUserExists, thought.getThoughtByID)
app.post("/api/thought/create", auth.authenticate, thought.createThought)
app.post("/api/thought/update/:thoughtID", auth.authenticate, thought.updateThought)
app.post("/api/thought/delete/:thoughtID", auth.authenticate, thought.deleteThought)

// Forum routes
// TODO

// Friend routes
app.get("/api/friend/list/:username", auth.authenticate, util.reqUserExists, friend.getFriends)
app.post("/api/friend/add/:username", auth.authenticate, util.reqUserExists, friend.addFriend)
app.post("/api/friend/decline/:username", auth.authenticate, util.reqUserExists, friend.declineFriend)

// Update routes
app.get("/api/update/list", auth.authenticate, update.getUpdates)
app.get("/api/update/:updateID", auth.authenticate, update.getUpdateByID)

app.listen(5000, () => { console.log("Server started on port 5000") })