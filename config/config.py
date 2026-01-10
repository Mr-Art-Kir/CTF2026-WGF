from dotenv import load_dotenv
import os

load_dotenv('./config/config.env')

JWT_TOKEN = os.getenv('SICRET_JWT_TOKEN')

