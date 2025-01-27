from util import test, reset_db
import auth
import requests

reset_db()

_, json = auth.register("friendtest", "friendtest@gmail.com", "password123")
cookies = {
    "token": json["token"],
}

_, json = auth.register("friendtest2", "friendtest2@gmail.com", "password123")
cookies2 = {
    "token": json["token"],
}

def list_friends(username, cookies):
    url = "http://localhost:5000/api/friend/list/" + username
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def add_friend(username, cookies):
    url = "http://localhost:5000/api/friend/add/" + username
    r = requests.post(url, cookies=cookies)
    return r, r.json()

def decline_friend(username, cookies):
    url = "http://localhost:5000/api/friend/decline/" + username
    r = requests.post(url, cookies=cookies)
    return r, r.json()

def remove_friend(username, cookies):
    url = "http://localhost:5000/api/friend/remove/" + username
    r = requests.post(url, cookies=cookies)
    return r, r.json()

def test_all():
    
    def to_test():
      r, json = list_friends("friendtest2", cookies)
      if "error" in json: return True, json
      return False, json
    test(
        describe="unsuccessful friends list",
        it="should say that you are not this user's friend",
        func=to_test,
    )

    def to_test():
      r, json = add_friend("friendtest2", cookies)
      if "error" in json: return False, json
      if r.status_code != 200: return False, json
      return True, json
    test(
        describe="successful friend add",
        it="should return success",
        func=to_test,
    )

    def to_test():
      r, json = decline_friend("friendtest", cookies2)
      if "error" in json: return False, json
      if r.status_code != 200: return False, json
      return True, json
    test(
        describe="successful friend decline",
        it="should return success",
        func=to_test,
    )

    def to_test():
      r, json = decline_friend("friendtest", cookies2)
      if "error" in json: return True, json
      return False, json
    test(
        describe="unsuccessful friend decline",
        it="should fail and say no friend request exists",
        func=to_test,
    )

    def to_test():
      r, json = add_friend("friendtest2", cookies)
      if "error" in json: return False, json
      if r.status_code != 200: return False, json
      return True, json
    test(
        describe="successful friend add",
        it="should return success",
        func=to_test,
    )

    def to_test():
      r, json = add_friend("friendtest", cookies2)
      if "error" in json: return False, json
      if r.status_code != 200: return False, json
      return True, json
    test(
        describe="successful friend add",
        it="should return success",
        func=to_test,
    )

    def to_test():
      r, json = list_friends("friendtest2", cookies2)
      if "error" in json: return False, json
      if r.status_code != 200: return False, json
      return True, json
    test(
        describe="successful friends list",
        it="should list your own friends",
        func=to_test,
    )

    def to_test():
      r, json = list_friends("friendtest2", cookies)
      if "error" in json: return False, json
      if r.status_code != 200: return False, json
      return True, json
    test(
        describe="successful friends list",
        it="should list their friend's friends",
        func=to_test,
    )

    def to_test():
      r, json = remove_friend("friendtest2", cookies)
      if "error" in json: return False, json
      if r.status_code != 200: return False, json
      return True, json
    test(
        describe="successful friend remove",
        it="should successfully remove friend",
        func=to_test,
    )

if __name__ == "__main__":
    test_all()