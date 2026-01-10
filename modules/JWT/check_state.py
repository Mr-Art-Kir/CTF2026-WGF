def check_token(token):
    import sys , os
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    sys.path.append(BASE_DIR)
    import jwt
    from config.config import JWT_TOKEN
    try:
        payload = jwt.decode(token, JWT_TOKEN, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return False
    
