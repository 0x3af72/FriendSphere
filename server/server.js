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
const comment = require('./routes/comment')
const homepage = require('./routes/homepage')
const media = require('./routes/media')
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

// SANITY
app.get("/api", auth.authenticate, (req, res) => {
  return res.status(200).json({ message: `You are logged in as ${req.user.username}` })
})

// Auth routes
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
app.get("/api/thought/:thoughtID", auth.authenticate, util.reqThoughtOrForumPostIDExists, thought.getThought)
app.get("/api/thought/list/:username", auth.authenticate, util.reqUserExists, thought.getThoughts)
app.post("/api/thought/create", auth.authenticate, thought.createThought)
app.post("/api/thought/update/:thoughtID", auth.authenticate, util.reqThoughtOrForumPostIDExists, thought.reqThoughtIsBySelf, thought.updateThought)
app.post("/api/thought/delete/:thoughtID", auth.authenticate, util.reqThoughtOrForumPostIDExists, thought.reqThoughtIsBySelf, thought.deleteThought)

// Forum routes
app.get("/api/forum/:forumPostID", auth.authenticate, util.reqThoughtOrForumPostIDExists, forum.getForumPost)
app.get("/api/forum/list/:username", auth.authenticate, util.reqUserExists, forum.getForumPosts)
app.get("/api/forum/search/:category", auth.authenticate, forum.searchForumPost) // ?searchTerm=y
app.post("/api/forum/create", auth.authenticate, forum.createForumPost)
app.post("/api/forum/update/:forumPostID", auth.authenticate, util.reqThoughtOrForumPostIDExists, forum.reqForumPostIsBySelf, forum.updateForumPost)
app.post("/api/forum/delete/:forumPostID", auth.authenticate, util.reqThoughtOrForumPostIDExists, forum.reqForumPostIsBySelf, forum.deleteForumPost)

// Friend routes
app.get("/api/friend/list/:username", auth.authenticate, util.reqUserExists, friend.reqUserIsFriendOrSelf, friend.getFriends)
app.post("/api/friend/add/:username", auth.authenticate, util.reqUserExists, util.reqUserNotSelf, friend.reqUserNotFriend, friend.addFriend)
app.post("/api/friend/decline/:username", auth.authenticate, util.reqUserExists, util.reqUserNotSelf, friend.declineFriend)
app.post("/api/friend/remove/:username", auth.authenticate, util.reqUserExists, util.reqUserNotSelf, friend.reqUserIsFriend, friend.removeFriend)

// Update routes
app.get("/api/update/list", auth.authenticate, update.getUpdates)
app.get("/api/update/:updateID", auth.authenticate, update.getUpdateByID)

// Comment routes
app.get("/api/comment/:commentID", auth.authenticate, comment.reqCommentExists, comment.getComment)
app.get("/api/comment/list/:thoughtOrForumID", auth.authenticate, util.reqThoughtOrForumPostIDExists, comment.getComments)
app.get("/api/comment/list/replies/:commentID", auth.authenticate, comment.reqCommentExists, comment.getReplies)
app.post("/api/comment/create/:thoughtOrForumID", auth.authenticate, util.reqThoughtOrForumPostIDExists, comment.createComment)
app.post("/api/comment/delete/:commentID", auth.authenticate, comment.reqCommentExists, comment.reqCommentIsBySelf, comment.deleteComment)

// Homepage routes
app.get("/api/homepage/:numThoughts", auth.authenticate, homepage.generateHomepage)

// Media routes
app.get("/api/media/:mediaID", auth.authenticate, media.getMedia)
app.post("/api/media/upload/:thoughtOrForumID", auth.authenticate, util.reqThoughtOrForumPostIDExists, upload.array("files", 100), media.uploadMedia)

app.listen(5000, () => { console.log("Server started on port 5000") })