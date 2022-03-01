from django.urls import path
from .views import CreateRoomView, GetRoom, JoinRoomView, RoomDestroyView, RoomView, UpdateRoomView, UserInRoomView, UserLeavesRoomView

urlpatterns = [
    path('room/<int:pk>/delete/', RoomDestroyView.as_view()),
    path('room', RoomView.as_view()),
    path('room/create', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoomView.as_view()),
    path('user-in-room', UserInRoomView.as_view()),
    path('leave-room', UserLeavesRoomView.as_view()),
    path('update-room', UpdateRoomView.as_view()),
]