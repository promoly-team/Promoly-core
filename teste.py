import requests

url = "http://localhost:3000/api/sendText"
headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Api-Key": ""
}
data = {
    "chatId": "update@c.us",
    "text": "Hi there!",
    "session": "default"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
