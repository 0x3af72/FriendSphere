from util import test, reset_db
import auth
import requests

reset_db()

def get_forum_post(forum_post_id, cookies):
    url = "http://localhost:5000/api/forum/" + forum_post_id
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def get_forum_posts(username, cookies):
    url = "http://localhost:5000/api/forum/list/" + username
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def search_forum_posts(search_term, category, cookies):
    url = f"http://localhost:5000/api/forum/search/{category}/?searchTerm={search_term}"
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def create_forum_post(cookies):
    url = "http://localhost:5000/api/forum/create"
    r = requests.post(url, json={
        "title": "sample forum post",
        "category": "Introductions",
        "html": "<h1>a person who thinks all the time has nothing to think but FORUM POSTS</h1><img src=a onerror=alert(1)>",
        "css": "h1{color:blue}",
    }, cookies=cookies)
    return r, r.json()

def update_forum_post(forum_post_id, cookies):
    url = "http://localhost:5000/api/forum/update/" + forum_post_id
    r = requests.post(url, json={
        "title": "sample forum post",
        "category": "Introductions",
        "html": "<h1>a person who thinks all the time has nothing to think but FORUM POSTS</h1><img src=a onerror=alert(1)>",
        "css": "h1{color:blue}",
    }, cookies=cookies)
    return r, r.json()

def delete_forum_post(forum_post_id, cookies):
    url = "http://localhost:5000/api/forum/delete/" + forum_post_id
    r = requests.post(url, cookies=cookies)
    return r, r.json()

def test_all():

    _, json = auth.register("forumtest", "forumtest@gmail.com", "password123")
    cookies = {
        "token": json["token"],
    }
    
    def to_test():
        global forum_post_id
        r, json = create_forum_post(cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        forum_post_id = json["id"]
        return True, json
    test(
        describe="successful forum post creation",
        it="should return forum post id",
        func=to_test,
    )
    
    def to_test():
        r, json = get_forum_post(forum_post_id, cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful forum post get",
        it="should return forum post",
        func=to_test,
    )
    
    def to_test():
        r, json = get_forum_posts("forumtest", cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful forum posts list",
        it="should return forum posts by user",
        func=to_test,
    )
    
    def to_test():
        r, json = update_forum_post(forum_post_id, cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful forum post update",
        it="should return success",
        func=to_test,
    )

    def to_test():
        r, json = search_forum_posts("samp", "Introductions", cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful forum post search",
        it="should return my forum post",
        func=to_test,
    )
    
    def to_test():
        r, json = delete_forum_post(forum_post_id, cookies)
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful forum post deletion",
        it="should return success",
        func=to_test,
    )

if __name__ == "__main__":
    test_all()