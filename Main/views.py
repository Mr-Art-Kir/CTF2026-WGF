from django.shortcuts import render
import logging, asyncio
from config.config import CTF_TOKEN
from modules.JWT.check_state import check_token

def index(request):
    cookies = request.COOKIES
    data = {"key":"0"}
    if 'state' not in cookies :

        from  modules.cookies.install_cookies import install_cookies
        return install_cookies(request)
    else:
        from  modules.cookies.install_cookies import install_cookies
        try:
            payload:dict  = check_token(request.COOKIES.get('state'))
            if payload.get('state') == 'user' or payload.get('state') == "Administrator" :
                if payload.get('state')  == 'Administrator':
                    data['state'] = "Administrator"
                    data['key'] = CTF_TOKEN
            else:
                return install_cookies(request)
        except Exception as e:
            return install_cookies(request)

    return render(request, 'index.html', context=data)

