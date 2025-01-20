const db = require('./db')
const { getFriends } = require('./friend')

// Get friends and friends of friends with distance
async function getFriendsNetworkByDistance(user, distance) {
  let friendsNetwork = []
  const visited = new Set()
  let last = [user]
  for (let curDist = 0; i != distance; i++) {
    let nextLast = []
    for (let user of last) {
      for (let friend of user.friends) {
        if (visited.has(friend)) continue
        nextLast.push(friend)
        friendsNetwork.push([friend, curDist])
      }
    }
    last = nextLast
  }
  return friendsNetwork
}

async function generateHomepage(req, res) {

  // Get friends and friends of friends
  let friendsNetwork = getFriendsNetworkByDistance(req.user, 3)

  // Get thoughts from friendsNetwork and sort by date
  let allThoughts = []
  for (let user of friendsNetwork) {
    
  }
  
}

module.exports = {
  generateHomepage,
}