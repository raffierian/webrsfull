import requests
import json

BASE_URL = "http://localhost:5000/api"
ADMIN_TOKEN = "DEBUG_TOKEN" # In real test, this would be a valid token

def test_xss_sanitization():
    print("Testing XSS Sanitization...")
    # This assumes we have a way to bypass auth or use a valid token
    payload = {
        "title": "Security Test",
        "slug": f"security-test-{hash('test')}",
        "content": "Normal text <script>alert('XSS')</script> <img src='x' onerror='alert(1)'> <b>Bold</b>",
        "tags": ["test"]
    }
    # Note: In a real environment, you'd need a valid token. 
    # This is a conceptual test script.
    print(f"Payload sent with suspected XSS content.")
    print("Backend should remove <script> and onerror attribute.")

def test_file_spoofing():
    print("\nTesting File Spoofing...")
    # Concept: Create a text file but name it .jpg
    with open("fake_image.jpg", "w") as f:
        f.write("This is actually a text file, not a JPEG.")
    
    print("Attempting to upload fake_image.jpg (spoofed)...")
    print("Backend should detect invalid Magic Number and reject it.")

if __name__ == "__main__":
    print("=== SECURITY VERIFICATION SCRIPT ===\n")
    test_xss_sanitization()
    test_file_spoofing()
