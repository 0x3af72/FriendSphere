require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const crypto = require('crypto')
const multer = require('multer')

const auth = require('./routes/auth')
const profile = require('./routes/profile')

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
app.post("/api/profile/pfp", auth.authenticate, upload.single("pfp"), profile.updatePfp)
app.post("/api/profile/html", auth.authenticate, profile.updateHTML)
app.post("/api/profile/css", auth.authenticate, profile.updateCSS)

app.listen(5000, () => { console.log("Server started on port 5000") })