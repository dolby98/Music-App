from django.urls import path
from .views import *

urlpatterns = [
    path('get-auth-url', AuthURLView.as_view()),
    path('redirect', spotify_callback),  
    path('is-authenticated', isAuthenticatedView.as_view()),
    path('current-song', getCurrentSongDetailsView.as_view()),  
    path('play-song', PlaySong.as_view()),
    path('pause-song', PauseSong.as_view()),
    path('play-pause-song', PlayPauseSongView.as_view()),
    path('skip-song', SkipSongView.as_view())
]
