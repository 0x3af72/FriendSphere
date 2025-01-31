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

async function getForumPost(req, res) {

  let forumPost = req.reqForumPost

  // Read HTML and CSS
  let html, css
  try {
    const forumPostData = path.join("data", req.reqUser.username, "forum_post", req.params?.forumPostID)
    html = (await fs.promises.readFile(path.join(forumPostData, "index.html"))).toString()
    css = (await fs.promises.readFile(path.join(forumPostData, "style.css"))).toString()
  } catch (error) {
    console.error("Error while reading forum post files:", error)
    return res.status(500).json({ error: "An error occurred while reading forum post files" })
  }

  return res.status(200).json({
    username: forumPost.username,
    id: forumPost.id,
    title: forumPost.title,
    html: html,
    css: css
  })
}

async function getForumPosts(req, res) {
  const forumPosts = await db.getForumPosts({ username: req.params?.username })
  const forumPostsJson = forumPosts
    .map(forumPost => ({
      id: forumPost.id,
      title: forumPost.title,
    }))
  return res.status(200).json(forumPostsJson)
}

async function searchForumPost(req, res) {
  let forumPosts = await db.getForumPosts({
    category: req.params?.category,
    searchTerm: req.query?.searchTerm,
  })
  const forumPostsJson = forumPosts
    .map(forumPost => ({
      username: forumPost.username,
      id: forumPost.id,
      title: forumPost.title,
    }))
  return res.status(200).json(forumPostsJson)
}

function validateForumPostFields(req, res) {
  try {

    // Check for required fields
    if (!req.body?.title || !req.body?.category || !req.body?.html || !req.body?.css) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check length of fields
    if (!(1 <= req.body?.title?.length && req.body?.title?.length <= 200)) {
      return res.status(400).json({ error: "Title must be between 1 and 200 characters" })
    }
    if (!(1 <= req.body?.html?.length)) {
      return res.status(400).json({ error: "HTML must be longer than 1 character" })
    }

    // Check for valid forum post category
    if (!forumCategories.includes(req.body?.category)) {
      return res.status(400).json({ error: "Invalid forum post category" })
    }

  } catch (error) {
    return res.status(500).json({ error: "An error occurred while verifying fields" })
  }
}

async function createForumPost(req, res) {

  // Field validation
  const validateRes = validateForumPostFields(req, res)
  if (validateRes) return validateRes

  // Create forum post
  const id = await db.createForumPost(req.user.username, req.body?.title, req.body?.category, req.body?.html, req.body?.css)
  if (id) {
    return res.status(200).json({ id: id })
  } else {
    return res.status(500).json({ error: "Error creating forum post" })
  }
}

async function updateForumPost(req, res) {

  // Field validation
  const validateRes = validateForumPostFields(req, res)
  if (validateRes) return validateRes

  // Update forum post
  if (await db.updateForumPost(req.params?.forumPostID, req.body?.title, req.body?.category)) {

    // Write HTML and CSS
    const forumPostData = path.join("data", req.user.username, "forum_post", req.params?.forumPostID)
    await fs.promises.writeFile(path.join(forumPostData, "index.html"), req.body?.html)
    await fs.promises.writeFile(path.join(forumPostData, "style.css"), req.body?.css)

    return res.status(200).json({ success: "Forum post updated successfully" })
  } else {
    return res.status(500).json({ error: "An error occurred while updating forum post" })
  }
}

async function deleteForumPost(req, res) {
  if (!(await db.deleteForumPost(req.params?.forumPostID))) {
    return res.status(500).json({ error: "An error occurred while deleting forum post" })
  } else {
    return res.status(200).json({ success: "Forum post deleted" })
  }
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