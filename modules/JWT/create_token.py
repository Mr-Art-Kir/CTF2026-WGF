import sys
import os
import jwt

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from config.config import JWT_TOKEN

def create_token():
    payload = {"state": "user"}
    token = jwt.encode(payload, JWT_TOKEN, algorithm='HS256')
    return token