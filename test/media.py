from util import test, reset_db
import auth
import thought
import requests

reset_db()

_, json = auth.register("mediatest", "mediatest@gmail.com", "password123")
cookies = {
    "token": json["token"],
}

_, json2 = auth.register("mediatest2", "mediatest2@gmail.com", "password123")
cookies2 = {
    "token": json2["token"],
}

_, json = thought.create_thought(False, cookies2)
thought_id = json["id"]

_, json = thought.create_thought(True, cookies2)
friends_only_thought_id = json["id"]

def upload_media(thought_or_forum_post_id, filename, cookies):
    url = "http://localhost:5000/api/media/upload/" + thought_or_forum_post_id
    with open(filename, "rb") as rb:
        r = requests.post(url, files=[("files", (filename, rb))], cookies=cookies)
        return r, r.json()
    
def get_media(media_id, cookies):
    url = "http://localhost:5000/api/media/" + media_id
    r = requests.get(url, cookies=cookies)
    return r, r.content

def test_all():
    
    def to_test():
        global media_id
        r, json = upload_media(thought_id, "data/image.jpeg", cookies2)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        media_id = json["image.jpeg"]
        return True, json
    test(
        describe="successful media upload",
        it="should return media ids",
        func=to_test,
    )

    def to_test():
        r, content = get_media(media_id, cookies)
        if r.status_code != 200: return False, content[:100]
        return True, content[:100]
    test(
        describe="successful media get",
        it="return the media",
        func=to_test,
    )

    def to_test():
        global media_id
        r, json = upload_media(friends_only_thought_id, "data/image.jpeg", cookies2)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        media_id = json["image.jpeg"]
        return True, json
    test(
        describe="successful media upload",
        it="should return media ids",
        func=to_test,
    )

    def to_test():
        r, content = get_media(media_id, cookies)
        if r.status_code != 404: return False, content
        return True, content
    test(
        describe="unsuccessful media get",
        it="fail and say media not found",
        func=to_test,
    )

    def to_test():
        r, json = upload_media(thought_id, "data/image.jpeg", cookies)
        if r.status_code != 401: return False, json
        if "error" in json: return True, json
        return False, json
    test(
        describe="unsuccessful media upload",
        it="should fail and say that you are not authorized",
        func=to_test,
    )
    
if __name__ == "__main__":
    test_all()