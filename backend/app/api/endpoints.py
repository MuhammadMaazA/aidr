from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
import json
from ..core.database import get_db
from ..schemas import disaster as schemas
from ..crud import disaster as crud

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

# Disaster Events
@router.post("/disasters/", response_model=schemas.DisasterEvent)
def create_disaster(disaster: schemas.DisasterEventCreate, db: Session = Depends(get_db)):
    return crud.create_disaster(db=db, disaster=disaster)

@router.get("/disasters/", response_model=List[schemas.DisasterEvent])
def read_disasters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    disasters = crud.get_disasters(db, skip=skip, limit=limit)
    return disasters

@router.get("/disasters/{disaster_id}", response_model=schemas.DisasterEvent)
def read_disaster(disaster_id: int, db: Session = Depends(get_db)):
    db_disaster = crud.get_disaster(db, disaster_id=disaster_id)
    if db_disaster is None:
        raise HTTPException(status_code=404, detail="Disaster not found")
    return db_disaster

# Damage Reports
@router.post("/damage-reports/", response_model=schemas.DamageReport)
def create_damage_report(report: schemas.DamageReportCreate, db: Session = Depends(get_db)):
    db_report = crud.create_damage_report(db=db, report=report)
    # Broadcast to connected clients
    asyncio.create_task(manager.broadcast(json.dumps({
        "type": "damage_report",
        "data": {
            "id": db_report.id,
            "damage_type": db_report.damage_type,
            "severity": db_report.severity,
            "latitude": db_report.latitude,
            "longitude": db_report.longitude
        }
    })))
    return db_report

@router.get("/damage-reports/", response_model=List[schemas.DamageReport])
def read_damage_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reports = crud.get_damage_reports(db, skip=skip, limit=limit)
    return reports

# Resources
@router.post("/resources/", response_model=schemas.Resource)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    return crud.create_resource(db=db, resource=resource)

@router.get("/resources/", response_model=List[schemas.Resource])
def read_resources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    resources = crud.get_resources(db, skip=skip, limit=limit)
    return resources

# Tasks
@router.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = crud.create_task(db=db, task=task)
    # Broadcast to connected clients
    asyncio.create_task(manager.broadcast(json.dumps({
        "type": "new_task",
        "data": {
            "id": db_task.id,
            "title": db_task.title,
            "priority": db_task.priority,
            "task_type": db_task.task_type,
            "latitude": db_task.latitude,
            "longitude": db_task.longitude
        }
    })))
    return db_task

@router.get("/tasks/", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = crud.get_tasks(db, skip=skip, limit=limit)
    return tasks

@router.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
    db_task = crud.update_task_status(db, task_id=task_id, status=status)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

# WebSocket endpoint
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Message received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Agent updates endpoint
@router.post("/agent-update")
async def agent_update(update: schemas.AgentUpdate):
    # Broadcast agent status to all connected clients
    await manager.broadcast(json.dumps({
        "type": "agent_update",
        "agent_type": update.agent_type,
        "status": update.status,
        "message": update.message,
        "data": update.data
    }))
    return {"status": "success"}

import asyncio