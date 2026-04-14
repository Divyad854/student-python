from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# -----------------------
# CONNECT MONGODB
# -----------------------
client = MongoClient(os.getenv("MONGO_URI"), serverSelectionTimeoutMS=5000)

try:
    client.server_info()
    print("✅ MongoDB Connected")
except Exception as e:
    print("❌ MongoDB Error:", e)

# ✅ USE DB FROM URI (pythonDb)
db = client.get_default_database()

users = db["users"]
students = db["students"]

# -----------------------
# AUTH
# -----------------------
def check_auth():
    return request.headers.get("Authorization")

# -----------------------
# REGISTER
# -----------------------
@app.route("/register", methods=["POST"])
def register():
    body = request.json

    name = body.get("name")
    email = body.get("email")
    password = body.get("password")
    confirm = body.get("confirm")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    if password != confirm:
        return jsonify({"error": "Passwords do not match"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    users.insert_one({
        "name": name,
        "email": email,
        "password": password
    })

    return jsonify({"message": "Registered successfully"})

# -----------------------
# LOGIN
# -----------------------
@app.route("/login", methods=["POST"])
def login():
    body = request.json

    email = body.get("email")
    password = body.get("password")

    user = users.find_one({"email": email, "password": password})

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "token": email,
        "name": user["name"]
    })

# -----------------------
# GET STUDENTS
# -----------------------
@app.route("/students", methods=["GET"])
def get_students():
    user = check_auth()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = list(students.find({"user": user}))

    for s in data:
        s["_id"] = str(s["_id"])

    return jsonify(data)

# -----------------------
# ADD STUDENT
# -----------------------
@app.route("/students", methods=["POST"])
def add_student():
    user = check_auth()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    body = request.json

    result = students.insert_one({
        "name": body.get("name"),
        "user": user
    })

    return jsonify({
        "_id": str(result.inserted_id),
        "name": body.get("name")
    })

# -----------------------
# DELETE STUDENT
# -----------------------
@app.route("/students/<sid>", methods=["DELETE"])
def delete_student(sid):
    user = check_auth()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    students.delete_one({
        "_id": ObjectId(sid),
        "user": user
    })

    return jsonify({"message": "Deleted"})

# -----------------------
# RUN
# -----------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)