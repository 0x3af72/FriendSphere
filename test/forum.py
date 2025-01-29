from util import test, reset_db
import auth
import requests

reset_db()

def create_forum_post(cookies):
    url = "http://localhost:5000/api/forum/create"
    r = requests.post(url, json={
        "title": "sample thought",
        "category": "Introductions",
        "html": "<h1>a person who thinks all the time has nothing to think but thoughts</h1><img src=a onerror=alert(1)>",
        "css": "h1{color:blue}",
    }, cookies=cookies)
    return r, r.json()