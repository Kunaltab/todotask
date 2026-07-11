from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.database import tasks, users
from bson import ObjectId
from datetime import datetime
from api.auth import verify_password, get_password_hash, create_access_token, decode_access_token
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["username"]

class User(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: User):
    if users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    users.insert_one({
        "username": user.username,
        "password": get_password_hash(user.password),
        "badges": ["Welcome to Ghibli"]
    })
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: User):
    db_user = users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    access_token = create_access_token(data={"username": db_user["username"]})
    return {"access_token": access_token, "token_type": "bearer", "username": db_user["username"], "badges": db_user.get("badges", [])}

@app.get("/me")
def get_me(username: str = Depends(get_current_user)):
    db_user = users.find_one({"username": username})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": db_user["username"], "badges": db_user.get("badges", [])}

@app.get("/tasks")
def get_tasks(username: str = Depends(get_current_user)):
    all_tasks = list(tasks.find({"user_id": username}))
    return [format_doc(task) for task in all_tasks]

@app.post("/tasks")
def add_task(data: dict, username: str = Depends(get_current_user)):
    task = {
        "user_id": username,
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "priority": data.get("priority", "Low"),
        "category": data.get("category", "General"),
        "due_date": data.get("due_date", ""),
        "completed": False,
        "day": data.get("day", ""),
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    result = tasks.insert_one(task)
    
    # Simple badge logic
    if tasks.count_documents({"user_id": username}) == 1:
        users.update_one({"username": username}, {"$addToSet": {"badges": "First Task Created"}})
        
    return {"message": "Task Added Successfully", "id": str(result.inserted_id)}

@app.put("/tasks/{task_id}")
def update_task(task_id: str, data: dict, username: str = Depends(get_current_user)):
    update_data = {}
    for key in ["title", "description", "priority", "category", "due_date", "completed"]:
        if key in data:
            update_data[key] = data[key]
            
    result = tasks.update_one({"_id": ObjectId(task_id), "user_id": username}, {"$set": update_data})
    
    # Check if completed and award badge
    if update_data.get("completed"):
        completed_count = tasks.count_documents({"user_id": username, "completed": True})
        if completed_count == 1:
            users.update_one({"username": username}, {"$addToSet": {"badges": "First Task Completed!"}})
        elif completed_count == 10:
            users.update_one({"username": username}, {"$addToSet": {"badges": "Focus Master"}})
            
    return {"message": "Task Updated Successfully"}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str, username: str = Depends(get_current_user)):
    tasks.delete_one({"_id": ObjectId(task_id), "user_id": username})
    return {"message": "Task Deleted Successfully"}

@app.post("/ai-planner")
def ai_planner(data: dict, username: str = Depends(get_current_user)):
    # Mock AI Task Planner
    idea = data.get("idea", "")
    tasks_generated = [
        {"title": f"Research: {idea}", "priority": "Medium", "category": "Planning"},
        {"title": f"Draft plan for {idea}", "priority": "High", "category": "Work"},
        {"title": f"Review {idea}", "priority": "Low", "category": "Review"}
    ]
    return {"tasks": tasks_generated}
