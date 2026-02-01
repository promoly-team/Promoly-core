import os
import requests
from dotenv import load_dotenv

load_dotenv()

WAHA_API_KEY = os.getenv("WAHA_API_KEY")

url = "http://waha:3000/api/sendText"

headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Api-Key": WAHA_API_KEY
}

data = {
    "chatId": "5527996956042@c.us",
    "text": "Hi there!",
    "session": "default" 
}

response = requests.post(url, json=data, headers=headers)
print(response.status_code, response.text)
