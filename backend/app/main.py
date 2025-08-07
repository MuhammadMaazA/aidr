from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import router
from .core.config import settings
from .core.database import engine
from .models import disaster

# Create database tables (commented out since we created them manually)
# disaster.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Project AIDR API",
    description="Agent-driven Integrated Disaster Response Platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "Project AIDR API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}