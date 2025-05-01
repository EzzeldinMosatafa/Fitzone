from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import NewsletterSerializer
from .models import Newsletter

# Create your views here.

@api_view(['POST'])
def subscribe(request):
    serializer = NewsletterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'message': 'Successfully subscribed to newsletter!',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'message': 'This email is already subscribed to our newsletter.',
            }, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
