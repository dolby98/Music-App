# Music-App
Django-React Project

The frontend is made using React and backend using Python(Django).

Idea is to create a room locally where people can join  the room and the host connects to Spotify(music app) to play songs. People joining this room can skip/play/pause the song 
using their own devices from which they have joined the room. 
The host can select if he wants people joining his room to have such rights or not.
He can also set that how many votes are required to skip a song.
When host creates a room, he can share the link or room code with people and they can join the same room and see on screen what song is playing.

The frontend folder has all component files for React.
The ConnectingSouls is the main app file of django, which has initial urls stored and is called when we run python server.
The api folder has all api's and views created in the backend in python. These apis are called from  the frontend for specific functionalities. It is related to create,update,delete
room details.
The Spotify folder has api's and views created to handle music requests inside the room. Such as to get song information, play/pause/skip songs,etc.
