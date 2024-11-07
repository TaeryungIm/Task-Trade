from cryptography.fernet import Fernet

# Generate a new key
# Use this when a new key is needed in advance
key = Fernet.generate_key()
print(key.decode())  # Print as a string for easy copy-paste
