import os
import random
import smtplib
from smtplib import SMTPException

from email.message import EmailMessage

import ssl
from ssl import create_default_context

from dotenv import load_dotenv

load_dotenv()

SSL_PORT = int(os.getenv("EMAIL_PORT_SSL"))
SENDER_SERVER = os.getenv("SENDER_SERVER")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

context = ssl.create_default_context()


def send_verification_email_userid(receiver_email: str):
    try:
        # Generate a 6-digit verification code
        verification_code = str(random.randint(100000, 999999))

        # Connect to SMTP server
        with smtplib.SMTP_SSL(SENDER_SERVER, SSL_PORT, context=context) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(
                SENDER_EMAIL,
                receiver_email,
                f"Subject: Email Verification Code\n\nYour verification code is: {verification_code}",
            )
        return verification_code

    except smtplib.SMTPException as smtp_error:
        raise smtp_error
    except Exception as e:
        raise e


def send_email_update_password(receiver_email: str):
    context = create_default_context()
    try:
        # Email content
        subject = "Password Update Request"
        body = f"""
        You requested to update your password.
        Please click the link below to update your password:
        http://127.0.0.1:8000/account/update/password

        If you did not request this, please ignore this email.
        """
        msg = EmailMessage()
        msg["From"] = SENDER_EMAIL
        msg["To"] = receiver_email
        msg["Subject"] = subject
        msg.set_content(body)

        # Connect to SMTP server and send the email
        with smtplib.SMTP_SSL(SENDER_SERVER, SSL_PORT, context=context) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        return "Password update email sent successfully"
    except smtplib.SMTPException as smtp_error:
        print(f"SMTP error occurred: {smtp_error}")
        raise SMTPException("Failed to send email")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise Exception("An unexpected error occurred")
