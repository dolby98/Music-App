from urllib import response
from requests import Request, post, put, get
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import *

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    #print(user_tokens)
    if(user_tokens.exists()):
        return user_tokens[0]
    else:
        return None

def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if(tokens):
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.save(update_fields=['access_token','refresh_token','token_type','expires_in'])
    else:
        tokens = SpotifyToken(user = session_id, access_token = access_token,token_type=token_type,expires_in=expires_in, refresh_token=refresh_token)
        tokens.save()

def is_Spotify_Authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if(tokens):
        #print(tokens)
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_Spotify_Token(session_id)

        return True

    return False

def refresh_Spotify_Token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token
    #print(refresh_token)
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()
    print(response)
    access_token = response.get('access_token')
    token_type = response.get('token_type')

    print("Hi I am ")
    print(refresh_token)
    expires_in = response.get('expires_in')

    update_or_create_user_tokens(session_id,access_token,token_type,expires_in,refresh_token)
    
def execute_Spotify_API_Calls(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    #print(tokens.access_token)
    header = {'Content-Type':'application/json',
              'Authorization':'Bearer '+tokens.access_token,
              'Accept': 'application/json'}
    
    if(post_):
        post(BASE_URL+endpoint,headers=header)
    if(put_):
        print(put(BASE_URL+endpoint,headers=header))
    else:
        response = get(BASE_URL + endpoint, {}, headers=header)
        print(response)
    try:
        return response.json()
    except:
        return {'Error':'Issue with request'}


def pressPlaySong(session_id):
    url = "player/play"
    return execute_Spotify_API_Calls(session_id, url, put_=True)

def pressPauseSong(session_id):
    url = "player/pause"
    return execute_Spotify_API_Calls(session_id, url, put_=True)

def skipSong(session_id):
    url= "player/next"
    return execute_Spotify_API_Calls(session_id, url, post_=True)
