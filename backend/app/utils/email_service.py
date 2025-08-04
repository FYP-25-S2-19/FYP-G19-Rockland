# Step 1: Add debug output to your email service
# Update your app/utils/email_service.py

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple

class EmailService:
    """Email service for sending verification codes and other emails"""
    
    @staticmethod
    def get_email_config():
        """Get email configuration from environment variables"""
        
        # Explicit debug output
        print("🔍 DEBUGGING EMAIL CONFIGURATION:")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Environment variables check:")
        
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = os.getenv('SMTP_PORT')
        email_user = os.getenv('EMAIL_USER')
        email_password = os.getenv('EMAIL_PASSWORD')
        from_name = os.getenv('FROM_NAME')
        
        print(f"  SMTP_SERVER: '{smtp_server}'")
        print(f"  SMTP_PORT: '{smtp_port}'")
        print(f"  EMAIL_USER: '{email_user}'")
        print(f"  EMAIL_PASSWORD: {'✓ Set (' + str(len(email_password)) + ' chars)' if email_password else '✗ None/Empty'}")
        print(f"  FROM_NAME: '{from_name}'")
        
        # Check if .env file exists
        env_path = os.path.join(os.getcwd(), '.env')
        print(f"  .env file path: {env_path}")
        print(f"  .env file exists: {os.path.exists(env_path)}")
        
        if os.path.exists(env_path):
            print("  .env file content preview:")
            with open(env_path, 'r') as f:
                lines = f.readlines()[:10]  # First 10 lines
                for i, line in enumerate(lines, 1):
                    if 'PASSWORD' in line:
                        print(f"    {i}: {line.split('=')[0]}=***")
                    else:
                        print(f"    {i}: {line.strip()}")
        
        return {
            'smtp_server': smtp_server or 'smtp.gmail.com',
            'smtp_port': int(smtp_port) if smtp_port else 587,
            'email_user': email_user,
            'email_password': email_password,
            'from_name': from_name or 'Rockland'
        }
    
    @staticmethod
    def send_verification_email(to_email: str, verification_code: str, user_name: str = None) -> Tuple[bool, str]:
        """Send email verification code"""
        try:
            config = EmailService.get_email_config()
            
            # Enhanced error checking with specific messages
            if not config['email_user']:
                error_msg = "EMAIL_USER environment variable is None or empty"
                print(f"❌ {error_msg}")
                return False, error_msg
            
            if not config['email_password']:
                error_msg = "EMAIL_PASSWORD environment variable is None or empty"
                print(f"❌ {error_msg}")
                return False, error_msg
            
            print(f"📧 Attempting to send email...")
            print(f"   From: {config['email_user']}")
            print(f"   To: {to_email}")
            print(f"   SMTP: {config['smtp_server']}:{config['smtp_port']}")
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Email Verification Code - Rockland'
            msg['From'] = f"{config['from_name']} <{config['email_user']}>"
            msg['To'] = to_email
            
            # Simple text content for testing
            text_content = f"""
            ROCKLAND - Email Verification Code
            
            Hello!
            
            Your verification code is: {verification_code}
            
            This code will expire in 15 minutes.
            
            © 2025 Rockland. All rights reserved.
            """
            
            text_part = MIMEText(text_content, 'plain')
            msg.attach(text_part)
            
            # Attempt to send email with detailed error handling
            print("🔄 Connecting to SMTP server...")
            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            print("✅ SMTP connection established")
            
            print("🔄 Starting TLS...")
            server.starttls()
            print("✅ TLS started")
            
            print("🔄 Attempting login...")
            server.login(config['email_user'], config['email_password'])
            print("✅ SMTP login successful")
            
            print("🔄 Sending email...")
            text = msg.as_string()
            server.sendmail(config['email_user'], to_email, text)
            print("✅ Email sent successfully")
            
            server.quit()
            print("✅ SMTP connection closed")
            
            print(f"✅ Verification email sent to {to_email}")
            return True, "Verification email sent successfully"
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP Authentication failed: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
        except smtplib.SMTPRecipientsRefused as e:
            error_msg = f"Recipient refused: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
        except smtplib.SMTPServerDisconnected as e:
            error_msg = f"SMTP server disconnected: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error sending email: {str(e)}"
            print(f"❌ {error_msg}")
            import traceback
            traceback.print_exc()
            return False, error_msg
    
    @staticmethod
    def send_welcome_email(to_email: str, user_name: str) -> Tuple[bool, str]:
        """Send welcome email after successful registration"""
        # Simplified for now - just return success
        return True, "Welcome email functionality temporarily disabled for debugging"
    
    @staticmethod
    def send_password_reset_email(to_email: str, verification_code: str, user_name: str = None) -> Tuple[bool, str]:
        """Send password reset verification code"""
        try:
            config = EmailService.get_email_config()
            
            if not config['email_user'] or not config['email_password']:
                error_msg = "Email configuration is incomplete"
                print(f"❌ {error_msg}")
                return False, error_msg
            
            print(f"📧 Sending password reset email to {to_email}")
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Password Reset Code - Rockland'
            msg['From'] = f"{config['from_name']} <{config['email_user']}>"
            msg['To'] = to_email
            
            # Email content
            text_content = f"""
            ROCKLAND - Password Reset Code
            
            Hello{' ' + user_name if user_name else ''}!
            
            You requested to reset your password. Your verification code is:
            
            {verification_code}
            
            This code will expire in 15 minutes.
            
            If you didn't request this password reset, please ignore this email.
            
            © 2025 Rockland. All rights reserved.
            """
            
            text_part = MIMEText(text_content, 'plain')
            msg.attach(text_part)
            
            # Send email
            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            server.starttls()
            server.login(config['email_user'], config['email_password'])
            server.sendmail(config['email_user'], to_email, msg.as_string())
            server.quit()
            
            print(f"✅ Password reset email sent to {to_email}")
            return True, "Password reset email sent successfully"
            
        except Exception as e:
            error_msg = f"Error sending password reset email: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg