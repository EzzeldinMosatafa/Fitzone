from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_password_reset_email(user, token):
    """Send password reset email with verification code"""
    try:
        subject = 'FitZone - Password Reset Code'
        
        # Create HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Password Reset - FitZone</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #3B82F6, #1E40AF);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: white;
                    padding: 30px;
                    border: 1px solid #e1e5e9;
                    border-radius: 0 0 10px 10px;
                }}
                .code-box {{
                    background: #f8f9fa;
                    border: 2px solid #EA580C;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 25px 0;
                }}
                .code {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #EA580C;
                    letter-spacing: 4px;
                    font-family: 'Courier New', monospace;
                }}
                .warning {{
                    background: #FEF3C7;
                    border-left: 4px solid #F59E0B;
                    padding: 15px;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    color: #6B7280;
                    font-size: 14px;
                    margin-top: 30px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏋️ FitZone</h1>
                <h2>Password Reset Request</h2>
            </div>
            
            <div class="content">
                <p>Hello <strong>{user.first_name}</strong>,</p>
                
                <p>We received a request to reset your password for your FitZone account. If you didn't make this request, please ignore this email.</p>
                
                <p>To reset your password, please use the verification code below:</p>
                
                <div class="code-box">
                    <div class="code">{token}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This code will expire in 15 minutes</li>
                        <li>Use this code only once</li>
                        <li>Don't share this code with anyone</li>
                    </ul>
                </div>
                
                <p>If you're having trouble resetting your password, please contact our support team.</p>
                
                <p>Stay strong! 💪<br>
                The FitZone Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2025 FitZone. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        plain_content = f"""
        FitZone - Password Reset Code
        
        Hello {user.first_name},
        
        We received a request to reset your password for your FitZone account.
        
        Your verification code is: {token}
        
        This code will expire in 15 minutes and can only be used once.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        The FitZone Team
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        return False


def send_password_reset_success_email(user):
    """Send confirmation email after successful password reset"""
    try:
        subject = 'FitZone - Password Reset Successful'
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Password Reset Successful - FitZone</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #10B981, #059669);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: white;
                    padding: 30px;
                    border: 1px solid #e1e5e9;
                    border-radius: 0 0 10px 10px;
                }}
                .success-box {{
                    background: #ECFDF5;
                    border: 2px solid #10B981;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 25px 0;
                }}
                .footer {{
                    text-align: center;
                    color: #6B7280;
                    font-size: 14px;
                    margin-top: 30px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏋️ FitZone</h1>
                <h2>✅ Password Reset Successful</h2>
            </div>
            
            <div class="content">
                <p>Hello <strong>{user.first_name}</strong>,</p>
                
                <div class="success-box">
                    <h3>🎉 Your password has been successfully reset!</h3>
                </div>
                
                <p>You can now log in to your FitZone account with your new password.</p>
                
                <p>If you didn't make this change, please contact our support team immediately.</p>
                
                <p>Keep crushing your fitness goals! 💪<br>
                The FitZone Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2025 FitZone. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        plain_content = f"""
        FitZone - Password Reset Successful
        
        Hello {user.first_name},
        
        Your password has been successfully reset!
        
        You can now log in to your FitZone account with your new password.
        
        If you didn't make this change, please contact our support team immediately.
        
        Best regards,
        The FitZone Team
        """
        
        send_mail(
            subject=subject,
            message=plain_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False,
        )
        
        logger.info(f"Password reset success email sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset success email to {user.email}: {str(e)}")
        return False