from util import test, reset_db
import auth
import thought
import forum
import requests

reset_db()

_, json = auth.register("commenttest", "commenttest@gmail.com", "password123")
cookies = {
    "token": json["token"],
}

_, json = auth.register("commenttest2", "commenttest2@gmail.com", "password123")
cookies2 = {
    "token": json["token"],
}

_, json = thought.create_thought(False, cookies2)
thought_id = json["id"]

_, json = thought.create_thought(True, cookies2)
friends_only_thought_id = json["id"]

_, json = forum.create_forum_post(cookies2)
forum_post_id = json["id"]

def create_comment(thought_or_forum_id, cookies):
    url = "http://localhost:5000/api/comment/create/" + thought_or_forum_id
    r = requests.post(url, json={
        "body": "hello world",
    }, cookies=cookies)
    return r, r.json()

def create_reply(thought_or_forum_id, cookies):
    url = "http://localhost:5000/api/comment/create/" + thought_or_forum_id
    r = requests.post(url, json={
        "body": "hello world",
    }, cookies=cookies)
    return r, r.json()

def delete_comment(comment_id, cookies):
    url = "http://localhost:5000/api/comment/delete/" + comment_id
    r = requests.post(url, cookies=cookies)
    return r, r.json()

def get_comment(comment_id, cookies):
    url = "http://localhost:5000/api/comment/" + comment_id
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def get_comments(thought_or_forum_id, cookies):
    url = "http://localhost:5000/api/list/" + thought_or_forum_id
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def get_replies(comment_id, cookies):
    url = "http://localhost:5000/api/list/replies/" + comment_id
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def test_all():

    def to_test():
        r, json = create_comment("this is my bio!", ["soccer", "swimming"], ["panic! at the disco", "green day"])
        if "error" in json: return False, json
        if not "success" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful profile update",
        it="should return success",
        func=to_test,
    )

if __name__ == "__main__":
    test_all()