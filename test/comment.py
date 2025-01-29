from util import test, reset_db
import auth
import friend
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

def create_reply(thought_or_forum_id, comment_id, cookies):
    url = "http://localhost:5000/api/comment/create/" + thought_or_forum_id
    r = requests.post(url, json={
        "body": "hello world",
    }, params={"replyToCommentID": comment_id}, cookies=cookies)
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
    url = "http://localhost:5000/api/comment/list/" + thought_or_forum_id
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def get_replies(comment_id, cookies):
    url = "http://localhost:5000/api/comment/list/replies/" + comment_id
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def test_all():

    def to_test():
        r, json = create_comment(thought_id, cookies)
        if "error" in json: return False, json
        if not "id" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful comment creation",
        it="should return comment id",
        func=to_test,
    )

    def to_test():
        r, json = create_comment(friends_only_thought_id, cookies)
        if r.status_code != 404: return False, json
        if "error" in json: return True, json
        return False, json
    test(
        describe="unsuccessful comment creation",
        it="should fail and say comment not found",
        func=to_test,
    )

    def to_test():
        global comment_id
        friend.add_friend("commenttest2", cookies)
        friend.add_friend("commenttest", cookies2)
        r, json = create_comment(friends_only_thought_id, cookies)
        if "error" in json: return False, json
        if not "id" in json: return False, json
        if r.status_code != 200: return False, json
        comment_id = json["id"]
        return True, json
    test(
        describe="successful comment creation",
        it="should return success",
        func=to_test,
    )

    def to_test():
        r, json = get_comment(comment_id, cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful comment get",
        it="should return the comment",
        func=to_test,
    )

    def to_test():
        r, json = create_reply(friends_only_thought_id, comment_id, cookies)
        if "error" in json: return False, json
        if not "id" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful reply creation",
        it="should return success",
        func=to_test,
    )

    def to_test():
        r, json = get_replies(comment_id, cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful replies get",
        it="should return replies",
        func=to_test,
    )

    def to_test():
        r, json = get_comments(friends_only_thought_id, cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful comments get",
        it="should return comments",
        func=to_test,
    )

    def to_test():
        friend.remove_friend("commenttest", cookies2)
        r, json = get_comments(friends_only_thought_id, cookies)
        if r.status_code != 404: return False, json
        if "error" in json: return True, json
        return False, json
    test(
        describe="unsuccessful comments get",
        it="should fail",
        func=to_test,
    )

    def to_test():
        r, json = delete_comment(comment_id, cookies)
        if "error" in json: return False, json
        if not "success" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful comment deletion",
        it="should return success",
        func=to_test,
    )

if __name__ == "__main__":
    test_all()