from colorama import Fore, init
import requests

init()

def printc(text, color):
    print(f"{color}{text}{Fore.RESET}")

cookies = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIyIiwiaWF0IjoxNzM0MjY4MDI5fQ.GGdrJxYZ8eow5KL0clGmNO8glY7USyQL2U10F0gC00I"
}

def test_generate_homepage():

    url = "http://localhost:5000/api/homepage/10"

    # Expected: Successful homepage generation
    printc("Testing: Successful homepage generation", Fore.YELLOW)

    r = requests.get(url, cookies=cookies)
    res = r.json()
    print(res)
    if "error" in res:
        printc("FAILED", Fore.RED)
    else:
        printc("SUCCESS", Fore.GREEN)

test_generate_homepage()