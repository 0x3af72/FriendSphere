from colorama import Fore, init
import requests

init()

def printc(text, color):
    print(f"{color}{text}{Fore.RESET}")

cookies = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE3MzMzMDE3Mzl9.kGcH4Kw6_AAbPPMsBTeg7CB2BIIS8O6wsINY6rvwl5M"
}

def test_update_profile():

    url = "http://localhost:5000/api/thought/create"

    # Expected: Successful thought create
    printc("Testing: Successful thought create", Fore.YELLOW)

    r = requests.post(url, json={"title": "my very first thought", "html": "<h1>a person who thinks all the time has nothing to think but thoughts</h1><img src=a onerror=alert(1)>", "css": "h1{color:blue}"}, cookies=cookies)
    res = r.json()
    print(res)
    if "id" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

test_update_profile()