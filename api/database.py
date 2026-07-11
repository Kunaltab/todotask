from pymongo import MongoClient
import os

client = MongoClient(os.environ.get("MONGO_URI", "mongodb://localhost:27017"))

db = client["todo_db"]

tasks = db["tasks"]
users = db["users"]