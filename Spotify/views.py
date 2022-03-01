import code
from os import stat
from urllib import request, response
from django.shortcuts import render

from api.models import Room
from .models import Vote
from .credentials import *
from rest_framework.views import APIView
from requests import Request, post
from rest_framework.response import Response
from rest_framework import status
from .util import *
from django.shortcuts import redirect
import base64
import json

class AuthURLView(APIView):
    def get(self,request,format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope' : scopes,
            'response_type' : 'code',
            'redirect_uri' : REDIRECT_URI,
            'client_id' : CLIENT_ID
        }).prepare().url

        return Response({'url':url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()
    print(response)
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
            request.session.create()
    
    update_or_create_user_tokens(request.session.session_key,access_token,token_type,expires_in,refresh_token)

    return redirect('frontend:')

class isAuthenticatedView(APIView):
    def get(self,request,format=None):
        is_authenticated = is_Spotify_Authenticated(request.session.session_key)
        return Response({'status':is_authenticated},status=status.HTTP_200_OK)
    
class getCurrentSongDetailsView(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if(room.exists()):
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host

        endpoint = "player/currently-playing"
        response = execute_Spotify_API_Calls(host,endpoint)

        #print(response)

        if('Error' in response or 'item' not in response):
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        for i,artist in enumerate(item.get('artists')):
            if(i>0):
                artist_string+=", "
            name = artist.get('name')
            artist_string += name
        
        votes = Vote.objects.filter(room=room, song_id=song_id)
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes':len(votes),
            'id':song_id,
            'votes_required_toSkip':room.votes_to_skip
        }
        #print(song)
        self.update_room_song(room, song_id)

        return Response({'SongObj':song}, status=status.HTTP_200_OK)

    def update_room_song(self, room, songId):
        current_song = room.current_song

        if(current_song != songId):
            room.current_song = songId
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        canPause = room.guest_can_pause

        if(self.request.session.session_key==host):
            print("I am the Hosttttttttttttttttttttt")
            pressPauseSong(host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        elif(canPause):
            pressPauseSong(host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'message':'You are not allowed to pause a song'}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        canPause = room.guest_can_pause

        if(self.request.session.session_key==host):
            pressPlaySong(host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        elif(canPause):
            pressPlaySong(host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'message':'You are not allowed to pause a song'}, status=status.HTTP_403_FORBIDDEN)

class PlayPauseSongView(APIView):
    def put(self, response, format=None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        canPause = room.guest_can_pause
        #print(response)
        #print(response.body)
        body = json.loads(response.body)
        print(body['playbackState'])
        isPlaying = body['playbackState']
        if(self.request.session.session_key==host or canPause):

            if(isPlaying):
                print("Pausing")
                url="player/pause"
            else:
                print("Playing")
                url="player/play"
            execute_Spotify_API_Calls(host, url, put_=True)

            return Response({}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'message':'You are not allowed to pause a song'}, status=status.HTTP_403_FORBIDDEN)

class SkipSongView(APIView):
    def post(self, request, format=None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if(self.request.session.session_key==room.host or len(votes)+1 >= votes_needed):
            votes.delete()
            skipSong(room.host)
            return Response({'votes':0}, status=status.HTTP_200_OK)
        else:
            vote = Vote(user=self.request.session.session_key, song_id=room.current_song, room=room)
            vote.save()
            pass

        return Response({}, status=status.HTTP_204_NO_CONTENT)


        