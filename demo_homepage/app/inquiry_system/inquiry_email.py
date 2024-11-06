import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv
import os

load_dotenv()

# Email settings loaded from .env file
EMAIL_HOST = os.getenv("EMAIL_HOST_DEFAULT", "smtp.naver.com")
EMAIL_PORT_TLS = int(os.getenv("EMAIL_PORT_TLS"))
EMAIL_TARGET = os.getenv("EMAIL_TARGET")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD_DEFAULT")


# Email-sending function
def send_email(from_email: str, subject: str, message: str, contact_method: str):
    # Create the email message
    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = EMAIL_TARGET
    msg["Subject"] = subject
    msg["Contact method"] = contact_method
    msg.attach(MIMEText(message, "plain"))

    # Send the email using SMTP
    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT_TLS) as server:
        server.starttls()  # Start TLS encryption
        try:
            print(from_email)
            server.login(from_email, EMAIL_PASSWORD)
        except smtplib.SMTPAuthenticationError as e:
            print(f"Authentication error: {e}")
            # Log additional details if needed
            raise

        server.sendmail(from_email, EMAIL_TARGET, msg.as_string())
