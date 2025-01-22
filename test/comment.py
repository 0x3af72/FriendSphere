from colorama import Fore, init
import requests

init()

def printc(text, color):
    print(f"{color}{text}{Fore.RESET}")

cookies = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE3MzMzMDE3Mzl9.kGcH4Kw6_AAbPPMsBTeg7CB2BIIS8O6wsINY6rvwl5M"
}

def test_create_comment():

    url = "http://localhost:5000/api/comment/create/cef8030f-aca4-41c4-92a4-390f68ba8d22"

    # Expected: Successful comment create
    printc("Testing: Successful comment create", Fore.YELLOW)

    r = requests.post(url, json={
        "body": "test comment",
        }, cookies=cookies)
    res = r.json()
    
    print(res)
    global commentID
    if "id" in res:
        commentID = res["id"]
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_list_comment():

    url = "http://localhost:5000/api/comment/list/cef8030f-aca4-41c4-92a4-390f68ba8d22"

    # Expected: Successful comment list
    printc("Testing: Successful comment list", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)
    res = r.json()
    
    print(res)
    if "error" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

def test_get_comment():

    url = "http://localhost:5000/api/comment/" + commentID

    # Expected: Successful comment get
    printc("Testing: Successful comment get", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)
    res = r.json()
    
    print(res)
    if "error" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

test_create_comment()
test_list_comment()
test_get_comment()