import os
import random
import smtplib
import ssl

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
