def install_cookies(request):
    from ..JWT.create_token import create_token
    from django.shortcuts import redirect
    token = create_token()    
    response = redirect(request.path)  
    response.set_cookie(
        key='state', 
        value=token, 
        httponly=False, 
        samesite='Lax'
    )
    return response