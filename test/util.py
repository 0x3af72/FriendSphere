from colorama import Fore, init
import requests
from pymongo import MongoClient

init()

def printc(text, color, end="\n"):
    print(f"{color}{text}{Fore.RESET}", end=end)

def test(describe, it, func):
    printc(f"""[!] Testing: "{describe}". It {it}.""", Fore.YELLOW, end=" ")
    res, json = func()
    if res:
        printc("[SUCCESS]", Fore.GREEN)
    else:
        printc("[FAIL]", Fore.RED)
    print(f" - {json}")

def reset_db():
    client = MongoClient("mongodb://localhost:27017/")
    if "FriendSphere" in client.list_database_names():
        client.drop_database("FriendSphere")