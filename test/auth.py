from util import test, reset_db
import requests

reset_db()

def register(username, email, password):
    url = "http://localhost:5000/api/register"
    r = requests.post(url, json={
        "username": username,
        "email": email,
        "password": password,
    })
    return r, r.json()

def login(username, password):
    url = "http://localhost:5000/api/login"
    r = requests.post(url, json={
        "username": username,
        "password": password,
    })
    return r, r.json()

def test_register():
    
    def to_test():
        r, json = register("registertest", "registertest@gmail.com", "password123")
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        if not "token" in json: return False, json
        return True, json
    test(
        describe="successful registration",
        it="should return the user's jwt token",
        func=to_test,
    )

    def to_test():
        r, json = register("registertest", "registertest2@gmail.com", "password123")
        if not "error" in json: return False, json
        if r.status_code != 200: return False, json
        if "token" in json: return False, json
        return True, json
    test(
        describe="unsuccessful registration (username taken)",
        it="should fail and say that username or email is taken",
        func=to_test,
    )

    def to_test():
        r, json = register("registertest2", "registertest@gmail.com", "password123")
        if not "error" in json: return False, json
        if r.status_code != 200: return False, json
        if "token" in json: return False, json
        return True, json
    test(
        describe="unsuccessful registration (email taken)",
        it="should fail and say that username or email is taken",
        func=to_test,
    )

    def to_test():
        r, json = register("registertestregistertestregistertestregistertest", "registertest2@gmail.com", "password123")
        if not "error" in json: return False, json
        if r.status_code != 400: return False, json
        if "token" in json: return False, json
        return True, json
    test(
        describe="unsuccessful registration (username too long)",
        it="should fail and say that username is too long",
        func=to_test,
    )

    def to_test():
        r, json = register("registertest2", "registertestregistertestregistertestregistertest@gmail.com", "password123")
        if not "error" in json: return False, json
        if r.status_code != 400: return False, json
        if "token" in json: return False, json
        return True, json
    test(
        describe="unsuccessful registration (email too long)",
        it="should fail and say that email is too long",
        func=to_test,
    )

    def to_test():
        r, json = register("registertest2", "registertest2@gmail.com", "p")
        if not "error" in json: return False, json
        if r.status_code != 400: return False, json
        if "token" in json: return False, json
        return True, json
    test(
        describe="unsuccessful registration (password too short)",
        it="should fail and say that password is too short",
        func=to_test,
    )
    
def test_login():
    
    register("logintest", "logintest@gmail.com", "password123")
    
    def to_test():
        r, json = login("logintest", "password123")
        if "error" in json: return False, json
        if r.status_code != 200: return False, json
        if not "token" in json: return False, json
        return True, json
    test(
        describe="successful login",
        it="should return the user's jwt token",
        func=to_test,
    )

    def to_test():
        r, json = login("logintest", "wrongpassword")
        if not "error" in json: return False, json
        if r.status_code != 200: return False, json
        if "token" in json: return False, json
        return True, json
    test(
        describe="successful login",
        it="should fail and say that password is invalid",
        func=to_test,
    )

if __name__ == "__main__":
    test_register()
    test_login()