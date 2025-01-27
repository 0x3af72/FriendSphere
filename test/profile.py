from util import test, reset_db
import auth
import requests

reset_db()

_, json = auth.register("profiletest", "profiletest@gmail.com", "password123")
cookies = {
    "token": json["token"],
}

def update_profile(bio, hobbies, music):
    url = "http://localhost:5000/api/profile"
    r = requests.post(url, json={
        "bio": bio,
        "hobbies": hobbies,
        "music": music,
    }, cookies=cookies)
    return r, r.json()

def update_pfp(filename):
    url = "http://localhost:5000/api/profile/pfp"
    with open(filename, "rb") as rb:
        files = {"pfp": rb}
        r = requests.post(url, files=files, cookies=cookies)
        return r, r.json()
    
def update_html(html):
    url = "http://localhost:5000/api/profile/html"
    r = requests.post(url, json={"html": html}, cookies=cookies)
    return r, r.json()

def update_css(css):
    url = "http://localhost:5000/api/profile/css"
    r = requests.post(url, json={"css": css}, cookies=cookies)
    return r, r.json()

def get_profile(username):
    url = f"http://localhost:5000/api/profile/{username}"
    r = requests.get(url, cookies=cookies)
    return r, r.json()

def get_pfp(username):
    url = f"http://localhost:5000/api/profile/{username}/pfp"
    r = requests.get(url, cookies=cookies)
    return r, r.content

def get_html(username):
    url = f"http://localhost:5000/api/profile/{username}/html"
    r = requests.get(url, cookies=cookies)
    return r, r.content
    
def get_css(username):
    url = f"http://localhost:5000/api/profile/{username}/css"
    r = requests.get(url, cookies=cookies)
    return r, r.content

def test_update_profile():
    
    def to_test():
        r, json = update_profile("this is my bio!", ["soccer", "swimming"], ["panic! at the disco", "green day"])
        if "error" in json: return False, json
        if not "success" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful profile update",
        it="should return success",
        func=to_test,
    )
    
    def to_test():
        r, json = update_pfp("data/pfp.jpg")
        if "error" in json: return False, json
        if not "success" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful pfp update",
        it="should return success",
        func=to_test,
    )
    
    def to_test():
        r, json = update_pfp("data/pfp_invalid.jpg")
        if not "error" in json: return False, json
        if r.status_code != 500: return False, json
        return True, json
    test(
        describe="unsuccessful pfp update",
        it="should fail",
        func=to_test,
    )
    
    def to_test():
        r, json = update_html("<h1>hello world</h1>")
        if "error" in json: return False, json
        if not "success" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful html update",
        it="should return success",
        func=to_test,
    )
    
    def to_test():
        r, json = update_css("body{color:red}")
        if "error" in json: return False, json
        if not "success" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful css update",
        it="should return success",
        func=to_test,
    )

def test_get_profile():
    
    def to_test():
        r, json = get_profile("profiletest")
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        return True, json
    test(
        describe="successful profile get",
        it="should return the user profile",
        func=to_test,
    )

    def to_test():
        r, content = get_pfp("profiletest")
        if r.status_code != 200: return False, content
        return True, {}
    test(
        describe="successful pfp get",
        it="should return an image",
        func=to_test,
    )

    def to_test():
        r, content = get_html("profiletest")
        if r.status_code != 200: return False, content
        if content != b"<h1>hello world</h1>": return False, content
        return True, content
    test(
        describe="successful html get",
        it="should return the html",
        func=to_test,
    )

    def to_test():
        r, content = get_css("profiletest")
        if r.status_code != 200: return False, content
        if content != b"body{color:red}": return False, content
        return True, content
    test(
        describe="successful css get",
        it="should return the css",
        func=to_test,
    )

if __name__ == "__main__":
    test_update_profile()
    test_get_profile()