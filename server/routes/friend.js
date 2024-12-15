const db = require('./db')

async function getFriends(req, res) {
  const otherUser = await db.getUser({ username: req.params?.username })
  if (req.username != req.params?.username && !otherUser.friends.includes(req.username)) {
    return res.status(401).json({ error: "You are not this user's friend!" })
  }
  return res.status(200).json(otherUser.friends)
}

async function addFriend(req, res) {

  // Check if message exists
  if (req.body?.message && !(req.body?.message?.length <= 200)) {
    return res.status(400).json({ error: "Message cannot exceed 200 characters" })
  }

  // Get user objects
  const user = await db.getUser({ username: req.username })
  const otherUser = await db.getUser({ username: req.params?.username })

  // Check if friends already
  if (user.friends.includes(req.params?.username)) {
    return res.status(401).json({ error: "You are already this user's friend" })
  }

  // Check for incoming friend request
  const updates = await db.getUpdates(req.username)
  for (let update of updates) {
    if (update.action == "FRIEND_REQUEST" && update.actionData.username == req.params?.username) {
      
      // Update DB
      user.friends.push(req.params?.username)
      otherUser.friends.push(req.username)
      await user.save()
      await otherUser.save()

      return res.status(200).json({ success: "Friend request accepted" })
    }
  }

  // Check if outgoing friend request already exists
  const otherUpdates = await db.getUpdates(req.params?.username)
  for (let update of otherUpdates) {
    if (update.action == "FRIEND_REQUEST" && update.actionData.username == req.username) {
      return res.status(401).json({ error: "An outgoing friend request already exists" })
    }
  }

  // Create update
  let updateMessage = `${req.username} has sent you a friend request! They have ${user.friends.length} friends.`
  if (req.body?.message) updateMessage += `\n${req.username} said: "${req.body?.message}"`
  if (await db.createUpdate(
    req.params?.username,
    `Friend request from ${req.username}`,
    updateMessage,
    "FRIEND_REQUEST",
    { username: req.username }
  )) {
    return res.status(200).json({ success: "Friend request sent" })
  }
  return res.status(500).json({ error: "An error occurred while sending friend request" })
}

async function declineFriend(req, res) {

  // Check for incoming friend request, remove update
  const updates = await db.getUpdates(req.username)
  for (let update of updates) {
    if (update.action == "FRIEND_REQUEST" && update.actionData.username == req.params?.username) {
      await update.deleteOne()
      return res.status(200).json({ success: "Friend request declined" })
    }
  }

  return res.status(404).json({ error: "Incoming friend request not found" })
}

async function removeFriend(req, res) {

  // Check if friends
  const user = await db.getUser({ username: req.username })
  if (!user.friends.includes(req.params?.username)) {
    return res.status(401).json({ error: "You are not this user's friend!" })
  }

  // Remove friend
  const otherUser = await db.getUser({ username: req.params?.username })
  user.friends = user.friends.filter(friend => friend != req.params?.username)
  otherUser.friends = otherUser.friends.filter(friend => friend != req.username)
  await user.save()
  await otherUser.save()
  
  return res.status(200).json({ success: "Friend removed" })
}

module.exports = {
  getFriends,
  addFriend,
  declineFriend,
  removeFriend,
}