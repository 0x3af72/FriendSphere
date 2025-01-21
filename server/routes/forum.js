const path = require('path')
const fs = require('fs')

const db = require('./db')

// Load config
let forumCategories
(async () => {forumCategories = await fs.promises.readFile("config/forum_categories.json")})()

async function reqForumPostIsBySelf(req, res, next) {
  if (req.reqForumPost.username != req.user.username) {
    return res.status(401).json({ error: "You are not authorized to perform this action" })
  }
  next()
}

function getForumPost(req, res) {
  
}

function getForumPosts(req, res) {
  
}

function searchForumPost(req, res) {
  
}

function createForumPost(req, res) {
  
}

function updateForumPost(req, res) {
  
}

function deleteForumPost(req, res) {

}

module.exports = {
  reqForumPostIsBySelf,
  getForumPost,
  getForumPosts,
  searchForumPost,
  createForumPost,
  updateForumPost,
  deleteForumPost,
}