from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from api.grade import router as grade_router

# Load environment variables
load_dotenv()

app = FastAPI(title="Automated Grading & TTS Tool")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(grade_router, prefix="/api", tags=["grading"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Automated Grading & TTS Tool API"}
