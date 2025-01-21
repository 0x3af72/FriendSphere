from colorama import Fore, init
import requests

init()

def printc(text, color):
    print(f"{color}{text}{Fore.RESET}")

cookies = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE3MzMzMDE3Mzl9.kGcH4Kw6_AAbPPMsBTeg7CB2BIIS8O6wsINY6rvwl5M"
}
cookies2 = {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIyIiwiaWF0IjoxNzM0MjY4MDI5fQ.GGdrJxYZ8eow5KL0clGmNO8glY7USyQL2U10F0gC00I"
}

def test_add_friend():

    url = "http://localhost:5000/api/friend/add/user2"

    # Expected: Successful friend request
    printc("Testing: Successful friend request", Fore.YELLOW)

    r = requests.post(url, cookies=cookies)
    res = r.json()
    print(res)
    if "success" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

    # Expected: Successful friend accept
    printc("Testing: Successful friend accept", Fore.YELLOW)

    url = "http://localhost:5000/api/friend/add/user"
    r = requests.post(url, cookies=cookies2)
    res = r.json()
    print(res)
    if "success" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_list_friend():
    
    url = "http://localhost:5000/api/friend/list/user2"

    # Expected: Successful friend list
    printc("Testing: Successful friend list", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)
    res = r.json()
    print(res)
    if "error" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

def test_remove_friend():

    url = "http://localhost:5000/api/friend/remove/user2"

    # Expected: Successful friend remove
    printc("Testing: Successful friend remove", Fore.YELLOW)

    r = requests.post(url, cookies=cookies)
    res = r.json()
    print(res)
    if "success" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_decline_friend():

    url = "http://localhost:5000/api/friend/add/user2"
    r = requests.post(url, cookies=cookies)

    url = "http://localhost:5000/api/friend/decline/user"

    # Expected: Successful friend decline
    printc("Testing: Successful friend decline", Fore.YELLOW)

    r = requests.post(url, cookies=cookies2)
    res = r.json()
    print(res)
    if "success" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

test_add_friend()
test_list_friend()
test_remove_friend()
test_decline_friend()
test_list_friend() # supposed to fail
test_add_friend()