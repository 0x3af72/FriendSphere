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

    pass

def test_upload_css():

    pass

test_upload_pfp()