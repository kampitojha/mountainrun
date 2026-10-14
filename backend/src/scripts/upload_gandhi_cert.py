import urllib.request
import hashlib
import time
import json

cloud_name = "yppcqzt6"
api_key = "992945359688545"
api_secret = "i09Z6GGV0QnznerVvDel_luTA_M"
timestamp = str(int(time.time()))
public_id = f"mountainrun/certificates/gandhi_cert_kampit_ojha_{timestamp}"

# signature = sha1(params in alphabetical order + secret)
param_str = f"public_id={public_id}&timestamp={timestamp}{api_secret}"
sig = hashlib.sha1(param_str.encode("utf-8")).hexdigest()

with open(r"backend\assets\kampit_gandhi_certificate_master.png", "rb") as f:
    img_data = f.read()

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = bytearray()

def add_field(name, val):
    body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{val}\r\n".encode("utf-8"))

add_field("api_key", api_key)
add_field("public_id", public_id)
add_field("signature", sig)
add_field("timestamp", timestamp)

body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"cert.png\"\r\nContent-Type: image/png\r\n\r\n".encode("utf-8"))
body.extend(img_data)
body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

req = urllib.request.Request(
    f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload",
    data=bytes(body),
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode("utf-8"))
    print("Uploaded to Cloudinary successfully!")
    url = res.get("secure_url")
    print("Secure URL:", url)
    with open(r"backend\assets\gandhi_cert_cloudinary_url.txt", "w") as out:
        out.write(url)
