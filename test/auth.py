from colorama import Fore, init
import requests

init()

def printc(text, color):
    print(f"{color}{text}{Fore.RESET}")

def test_register(username="user"):

    url = "http://localhost:5000/api/register"

    # Expected: Successful registration
    printc("Testing: Successful registration", Fore.YELLOW)

    data = {
        "username": username,
        "email": f"{username}@gmail.com",
        "password": "user12345",
    }

    r = requests.post(url, json=data)
    res = r.json()
    print(res)
    if "token" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

    # Expected: Unsuccessful registration (exists already)
    printc("Testing: Successful registration (exists already)", Fore.YELLOW)
    r = requests.post(url, json=data)
    res = r.json()
    print(res)
    if "token" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

def test_login():

    url = "http://localhost:5000/api/login"

    # Expected: Successful login
    printc("Testing: Successful login", Fore.YELLOW)

    data = {
        "username": "user",
        "password": "user12345",
    }

    r = requests.post(url, json=data)
    res = r.json()
    print(res)
    if "token" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

    # Expected: Unsuccessful login (invalid credentials)
    printc("Testing: Unsuccessful login (invalid credentials)", Fore.YELLOW)

    data = {
        "username": "user",
        "password": "user123456",
    }

    r = requests.post(url, json=data)
    res = r.json()
    print(res)
    if "token" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

test_register()
test_register("user2")
test_login()