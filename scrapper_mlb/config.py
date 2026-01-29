from dotenv import load_dotenv
import os
load_dotenv()
URL_MLB_BASE = os.getenv("URL_MLB_BASE")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64)"
}

CRED_JSON = "creds.json"
SHEET_NAME = "request"