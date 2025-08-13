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
        from_email = os.getenv('FROM_EMAIL', 'fyprockland@gmail.com')  # Default to verified sender
        
        print(f"  SMTP_SERVER: '{smtp_server}'")
        print(f"  SMTP_PORT: '{smtp_port}'")
        print(f"  EMAIL_USER: '{email_user}'")
        print(f"  EMAIL_PASSWORD: {'✓ Set (' + str(len(email_password)) + ' chars)' if email_password else '✗ None/Empty'}")
        print(f"  FROM_NAME: '{from_name}'")
        print(f"  FROM_EMAIL: '{from_email}'")
        
        return {
            'smtp_server': smtp_server or 'smtp.sendgrid.net',
            'smtp_port': int(smtp_port) if smtp_port else 587,
            'email_user': email_user,
            'email_password': email_password,
            'from_name': from_name or 'Rockland',
            'from_email': from_email
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
            print(f"   SMTP User: {config['email_user']}")
            print(f"   From Email: {config['from_email']}")
            print(f"   To: {to_email}")
            print(f"   SMTP: {config['smtp_server']}:{config['smtp_port']}")
            
            # Create message - FIXED: Use verified email for both From header and sendmail
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Email Verification Code - Rockland'
            msg['From'] = f"{config['from_name']} <{config['from_email']}>"  # Use verified email
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
            # FIXED: For SendGrid, use the API key directly as password, not email_user
            if config['email_user'] == 'apikey':
                server.login('apikey', config['email_password'])  # SendGrid format
            else:
                server.login(config['email_user'], config['email_password'])  # Regular SMTP
            print("✅ SMTP login successful")
            
            print("🔄 Sending email...")
            text = msg.as_string()
            # FIXED: Use the verified sender email for envelope FROM
            server.sendmail(config['from_email'], to_email, text)
            print("✅ Email sent successfully")
            
            server.quit()
            print("✅ SMTP connection closed")
            
            print(f"✅ Verification email sent to {to_email}")
            return True, "Verification email sent successfully"
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP Authentication failed: {str(e)}"
            print(f"❌ {error_msg}")
            print("💡 Troubleshooting tips:")
            print("   - Verify your SendGrid API key is correct")
            print("   - Ensure EMAIL_USER='apikey' for SendGrid")
            print("   - Check if your SendGrid account is active")
            return False, error_msg
        except smtplib.SMTPRecipientsRefused as e:
            error_msg = f"Recipient refused: {str(e)}"
            print(f"❌ {error_msg}")
            print("💡 Troubleshooting tips:")
            print("   - Check if the recipient email is valid")
            print("   - Verify your FROM_EMAIL is verified in SendGrid")
            return False, error_msg
        except smtplib.SMTPSenderRefused as e:
            error_msg = f"Sender refused: {str(e)}"
            print(f"❌ {error_msg}")
            print("💡 Troubleshooting tips:")
            print("   - Verify fyprockland@gmail.com is added as verified sender in SendGrid")
            print("   - Check SendGrid dashboard for sender verification status")
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
        try:
            config = EmailService.get_email_config()
            
            if not config['email_user'] or not config['email_password']:
                error_msg = "Email configuration is incomplete"
                print(f"❌ {error_msg}")
                return False, error_msg
            
            print(f"📧 Sending welcome email to {to_email}")
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Welcome to Rockland!'
            msg['From'] = f"{config['from_name']} <{config['from_email']}>"
            msg['To'] = to_email
            
            # Email content
            text_content = f"""
ROCKLAND - Welcome!

Hello {user_name}!

Welcome to Rockland! Your account has been successfully created.

Get started by exploring our features and discovering amazing rocks!

Thank you for joining our community.

© 2025 Rockland. All rights reserved.
            """
            
            text_part = MIMEText(text_content, 'plain')
            msg.attach(text_part)
            
            # Send email
            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            server.starttls()
            
            # Fixed login for SendGrid
            if config['email_user'] == 'apikey':
                server.login('apikey', config['email_password'])
            else:
                server.login(config['email_user'], config['email_password'])
                
            server.sendmail(config['from_email'], to_email, msg.as_string())
            server.quit()
            
            print(f"✅ Welcome email sent to {to_email}")
            return True, "Welcome email sent successfully"
            
        except Exception as e:
            error_msg = f"Error sending welcome email: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg
    
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
            msg['From'] = f"{config['from_name']} <{config['from_email']}>"
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
            
            # Fixed login for SendGrid
            if config['email_user'] == 'apikey':
                server.login('apikey', config['email_password'])
            else:
                server.login(config['email_user'], config['email_password'])
                
            server.sendmail(config['from_email'], to_email, msg.as_string())
            server.quit()
            
            print(f"✅ Password reset email sent to {to_email}")
            return True, "Password reset email sent successfully"
            
        except Exception as e:
            error_msg = f"Error sending password reset email: {str(e)}"
            print(f"❌ {error_msg}")
            return False, error_msg