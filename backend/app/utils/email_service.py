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
        email_user = os.getenv('EMAIL_USER')       # For SendGrid: 'apikey'
        email_password = os.getenv('EMAIL_PASSWORD')  # For SendGrid: API key
        from_name = os.getenv('FROM_NAME')
        from_email = os.getenv('FROM_EMAIL')       # The actual verified sender

        print(f"  SMTP_SERVER: '{smtp_server}'")
        print(f"  SMTP_PORT: '{smtp_port}'")
        print(f"  EMAIL_USER: '{email_user}'")
        print(f"  EMAIL_PASSWORD: {'✓ Set (' + str(len(email_password)) + ' chars)' if email_password else '✗ None/Empty'}")
        print(f"  FROM_NAME: '{from_name}'")
        print(f"  FROM_EMAIL: '{from_email}'")

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
            'from_name': from_name or 'Rockland',
            'from_email': from_email
        }

    @staticmethod
    def send_verification_email(to_email: str, verification_code: str, user_name: str = None) -> Tuple[bool, str]:
        """Send email verification code"""
        try:
            config = EmailService.get_email_config()

            if not config['email_user']:
                return False, "EMAIL_USER environment variable is None or empty"
            if not config['email_password']:
                return False, "EMAIL_PASSWORD environment variable is None or empty"
            if not config['from_email']:
                return False, "FROM_EMAIL environment variable is None or empty"

            print(f"📧 Attempting to send email...")
            print(f"   From: {config['from_email']}")
            print(f"   To: {to_email}")
            print(f"   SMTP: {config['smtp_server']}:{config['smtp_port']}")

            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Email Verification Code - Rockland'
            msg['From'] = f"{config['from_name']} <{config['from_email']}>"
            msg['To'] = to_email

            text_content = f"""
            ROCKLAND - Email Verification Code

            Hello {user_name if user_name else ''}!

            Your verification code is: {verification_code}

            This code will expire in 15 minutes.

            © 2025 Rockland. All rights reserved.
            """
            msg.attach(MIMEText(text_content, 'plain'))

            # Connect & send
            print("🔄 Connecting to SMTP server...")
            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            print("✅ SMTP connection established")

            print("🔄 Starting TLS...")
            server.starttls()
            print("✅ TLS started")

            print("🔄 Attempting login...")
            server.login(config['email_user'], config['email_password'])  # apikey + API key
            print("✅ SMTP login successful")

            print("🔄 Sending email...")
            server.sendmail(config['from_email'], to_email, msg.as_string())  # Use verified FROM_EMAIL
            print("✅ Email sent successfully")

            server.quit()
            print("✅ SMTP connection closed")
            return True, "Verification email sent successfully"

        except Exception as e:
            print(f"❌ Error sending verification email: {e}")
            import traceback
            traceback.print_exc()
            return False, str(e)

    @staticmethod
    def send_welcome_email(to_email: str, user_name: str) -> Tuple[bool, str]:
        return True, "Welcome email functionality temporarily disabled for debugging"

    @staticmethod
    def send_password_reset_email(to_email: str, verification_code: str, user_name: str = None) -> Tuple[bool, str]:
        try:
            config = EmailService.get_email_config()

            if not config['email_user'] or not config['email_password'] or not config['from_email']:
                return False, "Email configuration is incomplete"

            print(f"📧 Sending password reset email to {to_email}")

            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Password Reset Code - Rockland'
            msg['From'] = f"{config['from_name']} <{config['from_email']}>"
            msg['To'] = to_email

            text_content = f"""
            ROCKLAND - Password Reset Code

            Hello {user_name if user_name else ''}!

            You requested to reset your password. Your verification code is:

            {verification_code}

            This code will expire in 15 minutes.

            If you didn't request this password reset, please ignore this email.

            © 2025 Rockland. All rights reserved.
            """
            msg.attach(MIMEText(text_content, 'plain'))

            server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
            server.starttls()
            server.login(config['email_user'], config['email_password'])
            server.sendmail(config['from_email'], to_email, msg.as_string())
            server.quit()

            print(f"✅ Password reset email sent to {to_email}")
            return True, "Password reset email sent successfully"

        except Exception as e:
            print(f"❌ Error sending password reset email: {e}")
            return False, str(e)
