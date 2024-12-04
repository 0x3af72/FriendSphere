require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const crypto = require('crypto')

const auth = require('./routes/auth')
const profile = require('./routes/profile')

const app = express()
app.use(express.json())
app.use(cookieParser());

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
app.post("/api/:username/profile/pfp", auth.authenticate, profile.updatePfp)
app.post("/api/:username/profile/html", auth.authenticate, profile.updateHTML)
app.post("/api/:username/profile/css", auth.authenticate, profile.updateCSS)

app.listen(5000, () => { console.log("Server started on port 5000") })