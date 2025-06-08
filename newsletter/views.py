from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .serializers import NewsletterSerializer
from .models import Newsletter
from django.core.mail import send_mail
from django.conf import settings

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

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def newsletter_list(request):
    subscribers = Newsletter.objects.all()
    serializer = NewsletterSerializer(subscribers, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def send_newsletter_email(request):
    try:
        print("\n=== Newsletter Email Request ===")
        print(f"Request Data: {request.data}")
        
        emails = request.data.get('emails', [])
        message = request.data.get('message', '')
        
        print(f"Emails (type: {type(emails)}): {emails}")
        print(f"Message (type: {type(message)}): {message}")
        
        if not emails or not message:
            print("Error: Missing emails or message")
            return Response({'error': 'Emails and message are required.'}, status=400)
        
        # Ensure emails is a list
        if isinstance(emails, str):
            emails = [emails]
        elif not isinstance(emails, list):
            try:
                emails = list(emails)
            except Exception as e:
                print(f"Error converting emails to list: {str(e)}")
                return Response({'error': 'Invalid email format'}, status=400)
        
        print(f"Processed emails: {emails}")
        
        # Email settings check
        print("\n=== Email Settings ===")
        print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
        print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
        print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
        print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
        
        try:
            # Test connection to SMTP server
            from smtplib import SMTP
            smtp = SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            smtp.ehlo()
            if settings.EMAIL_USE_TLS:
                smtp.starttls()
            smtp.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            print("SMTP Connection Test: Successful")
            smtp.quit()
            
            # Send the actual email
            send_mail(
                subject='FitZone Newsletter',
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=emails,
                fail_silently=False,
                html_message=message  # Allow HTML formatting
            )
            
            return Response({
                'message': 'Newsletter sent successfully',
                'recipients': len(emails)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return Response({
                'error': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        print(f"Error in send_newsletter_email: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_newsletter_subscriber(request, pk):
    try:
        subscriber = Newsletter.objects.get(pk=pk)
        subscriber.delete()
        return Response({'message': 'Subscriber deleted.'}, status=204)
    except Newsletter.DoesNotExist:
        return Response({'error': 'Subscriber not found.'}, status=404)
