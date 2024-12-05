from colorama import Fore, init
import requests

init()

def printc(text, color):
    print(f"{color}{text}{Fore.RESET}")

cookies = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE3MzMzMDE3Mzl9.kGcH4Kw6_AAbPPMsBTeg7CB2BIIS8O6wsINY6rvwl5M"
}

def test_upload_pfp():

    url = "http://localhost:5000/api/profile/pfp"

    # Expected: Successful pfp upload
    printc("Testing: Successful pfp upload", Fore.YELLOW)

    with open("pfp.jpg", "rb") as rb:

        files = {"pfp": rb}

        r = requests.post(url, files=files, cookies=cookies)
        res = r.json()
        print(res)
        if "success" in res:
            printc("SUCCESS", Fore.GREEN)
        else:
            printc("FAILED", Fore.RED)

    # Expected: Unsuccessful pfp upload
    printc("Testing: Unsuccessful pfp upload", Fore.YELLOW)

    with open("pfp_invalid.jpg", "rb") as rb:

        files = {"pfp": rb}

        r = requests.post(url, files=files, cookies=cookies)
        res = r.json()
        print(res)
        if "success" in res:
            printc("FAILED", Fore.RED)
        else:
            printc("SUCCESS", Fore.GREEN)

def test_upload_html():

    url = "http://localhost:5000/api/profile/html"

    # Expected: Successful HTML upload
    printc("Testing: Successful HTML upload", Fore.YELLOW)

    r = requests.post(url, json={"html": "<h1>hello world</h1>"}, cookies=cookies)
    res = r.json()
    print(res)
    if "success" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_upload_css():

    url = "http://localhost:5000/api/profile/css"

    # Expected: Successful CSS upload
    printc("Testing: Successful CSS upload", Fore.YELLOW)

    r = requests.post(url, json={"css": "h1{color: red;}"}, cookies=cookies)
    res = r.json()
    print(res)
    if "success" in res:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_get_pfp():

    url = "http://localhost:5000/api/user/profile/pfp"

    # Expected: Successful pfp get
    printc("Testing: Successful pfp get", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)

    if b"error" in r.content:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

    # Expected: Unsuccessful pfp get
    printc("Testing: Unsuccessful pfp get", Fore.YELLOW)

    url = "http://localhost:5000/api/doesnotexist/profile/pfp"
    r = requests.get(url, cookies=cookies)

    if b"error" in r.content:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_get_html():

    url = "http://localhost:5000/api/user/profile/html"

    # Expected: Successful HTML get
    printc("Testing: Successful HTML get", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)

    if b"error" in r.content:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

    # Expected: Unsuccessful HTML get
    printc("Testing: Unsuccessful HTML get", Fore.YELLOW)

    url = "http://localhost:5000/api/doesnotexist/profile/html"
    r = requests.get(url, cookies=cookies)
    
    if b"error" in r.content:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

def test_get_css():

    url = "http://localhost:5000/api/user/profile/css"

    # Expected: Successful CSS get
    printc("Testing: Successful CSS get", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)

    if b"error" in r.content:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

    # Expected: Unsuccessful CSS get
    printc("Testing: Unsuccessful CSS get", Fore.YELLOW)

    url = "http://localhost:5000/api/doesnotexist/profile/css"
    r = requests.get(url, cookies=cookies)
    
    if b"error" in r.content:
        printc("SUCCESS", Fore.GREEN)
    else:
        printc("FAILED", Fore.RED)

test_upload_pfp()
test_upload_html()
test_upload_css()
test_get_pfp()
test_get_html()
test_get_css()