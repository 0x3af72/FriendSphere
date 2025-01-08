from colorama import Fore, init
import requests

init()

def printc(text, color):
    print(f"{color}{text}{Fore.RESET}")

cookies = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE3MzMzMDE3Mzl9.kGcH4Kw6_AAbPPMsBTeg7CB2BIIS8O6wsINY6rvwl5M"
}

def test_create_thought():

    url = "http://localhost:5000/api/thought/create"

    # Expected: Successful thought create
    printc("Testing: Successful thought create", Fore.YELLOW)

    r = requests.post(url, json={
        "title": "my very first thought",
        "html": "<h1>a person who thinks all the time has nothing to think but thoughts</h1><img src=a onerror=alert(1)>",
        "css": "h1{color:blue}",
        "friendsOnly": False,
        }, cookies=cookies)
    res = r.json()
    print(res)
    global thoughtID
    if "id" in res:
        thoughtID = res["id"]
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_get_thoughts():

    url = "http://localhost:5000/api/thought/list/user"

    # Expected: Successful thoughts get
    printc("Testing: Successful thoughts get", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)
    res = r.json()
    print(res)
    if "error" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

def test_get_thought():

    url = "http://localhost:5000/api/thought/" + thoughtID

    # Expected: Successful thought get
    printc("Testing: Successful thought get", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)
    res = r.json()
    print(res)
    if "error" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

def test_update_thought():

    url = "http://localhost:5000/api/thought/update/" + thoughtID

    # Expected: Successful thought update
    printc("Testing: Successful thought update", Fore.YELLOW)

    r = requests.post(url, json={
      "title": "my very first thought",
      "html": "<h1>a person who thinks all the time has nothing to think but thoughts</h1><img src=a onerror=alert(1)>",
      "css": "h1{color:blue}",
      "friendsOnly": True,
      }, cookies=cookies)
    res = r.json()
    print(res)
    if "success" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

test_create_thought()
test_get_thoughts()
test_get_thought()
test_update_thought()