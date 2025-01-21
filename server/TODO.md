# TODO

1. Write logic for Update, in db.js [ok]

2. Write API for Update, in update.js [ok]

3. Write API friend.js, this requires Update to be written (how else would users know who's adding them) [ok]

3.5. DOMPurify on client side not server side [ok]

4. TEST friend.js [ok]

5. Comments (these can be on forums, or on thoughts)
 - test comments

6. Replies (these are on comments)
 - test replies

7. Homepage generation [ok]
 - show thoughts
  - from friends
  - from friends of friends (which are not friendsonly)

8. Forum

9. Homepage generation
 - show forum posts
  - from categories the user is interested in?

10. How to attach media to thoughts? [ok]
 - i want to do this for forum posts too
 - route to get? and then automatically insert the thoughtID into the DOM so that it works?
 - then we need a place to add files
 - remember to add deletion functionality on thought or forumpost deletion
 - "src" replacement will be done on client side %something.jpg% -> link
 - TEST IT