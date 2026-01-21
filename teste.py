import requests

url = "http://localhost:3000/api/sendText"
headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Api-Key": "f9bfac29c0654fb0b3f0d412c736607c"
}
data = {
    "chatId": "5527996956042@c.us",
    "text": "Hi there!",
    "session": "default"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())