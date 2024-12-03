import requests

headers = {
    "Content-Type": "application/json",
}

data = {
    "username": "username",
    "email": "john123@gmail.com",
    "password": "john12345",
}

cookies = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5wb3JrMiIsImlhdCI6MTczMzEzNDU2Nn0.5I6YhITwT26uoRs_OhdHW8ocWzkNjr9VNFEvA4r23ws"
}

url = "http://localhost:5000/login"

r = requests.post(url, headers=headers, json=data, cookies=cookies)
print(r.content)