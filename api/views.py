from django.http.response import JsonResponse
from rest_framework import generics, status

from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response


# Create your views here.
''''
def main(request):
    return HttpResponse("Hey Beauty")
'''

class RoomView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class RoomDestroyView(generics.DestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'
    print("Getting Room")
    def get(self, request, format='None'):
        print(request)
        code = request.GET.get(self.lookup_url_kwarg)
        print(code)
        print(request.GET)
        print(request.GET['code'])
        print("HIIIII")
        if code != None:
            room = Room.objects.filter(code=code)
            print(room)
            if(len(room)>0):
                print(RoomSerializer(room[0]))
                data = RoomSerializer(room[0]).data
                print(data)
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status = status.HTTP_200_OK)
            return Response({'room not Found: Inavlid room code'},status=status.HTTP_404_NOT_FOUND)

        return Response({'Room parameter not found'},status=status.HTTP_400_BAD_REQUEST)

class JoinRoomView(APIView):
    lookup_url_kwarg = 'room_Code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        print(request)
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if(len(room_result)>0):
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message':'Room Joined!!!'}, status=status.HTTP_200_OK)
            
            return Response({'Bad Request':'Inavlid room code'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request':'Inavlid post data, could not find a code'}, status=status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer 

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        print(request)
        serializer = self.serializer_class(data=request.data)
        #print(serializer.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data['guest_can_pause']
            votes_to_skip = serializer.data['votes_to_skip']
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            print(queryset.exists())
            print("hi")
            print(queryset)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause','votes_to_skip'])
                print(room.code)
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host = host, guest_can_pause = guest_can_pause, votes_to_skip = votes_to_skip)
                room.save()
                print(room.code)
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
            
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class UserInRoomView(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        print(request)
        s = self.request.session
        print(self.request.session)
        data={
            'code' : self.request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)

class UserLeavesRoomView(APIView):
    print("Helloji")
    def post(self, request, format=None):
        print("Hello")
        if 'room_code' in self.request.session:
            print("HI")
            self.request.session.pop('room_code')
            user_host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=user_host_id)
            if(len(room_results)>0):
                room = room_results[0]
                room.delete()
        
        return Response({'Message' : 'Success'}, status=status.HTTP_200_OK)

class UpdateRoomView(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            
            guest_can_pause = serializer.data['guest_can_pause']
            votes_to_skip = serializer.data['votes_to_skip']
            code = serializer.data['code']
            
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg':'Room does not exist!!!'}, status=status.HTTP_404_NOT_FOUND)
            
            room = queryset[0]
            user_host_id = self.request.session.session_key
            if room.host != user_host_id:
                return Response({'msg':'You do not have rights to edit !!!'}, status=status.HTTP_403_FORBIDDEN)
            
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause','votes_to_skip'])
            print(room.code)

            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
              
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


                

        
