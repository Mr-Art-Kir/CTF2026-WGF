from django.shortcuts import render
import logging, asyncio
from config.config import JWT_TOKEN
from modules.JWT.check_state import check_token

def index(request):
    cookies = request.COOKIES
    data = {}
    if 'state' not in cookies :

        from  modules.cookies.install_cookies import install_cookies
        return install_cookies(request)
    else:
        payload:dict  = check_token(request.COOKIES.get('state'))
        if payload.get('state') == 'user' or payload.get('state') == "Administrator" :
            if payload.get('state')  == 'Administrator':
                data['state'] = "Administrator"
        else:
            print("State not found in cookies. Installing cookies...")
            from  modules.cookies.install_cookies import install_cookies
            return install_cookies(request)
    return render(request, 'index.html', context=data)

