from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DisasterEventBase(BaseModel):
    name: str
    event_type: str
    severity: int
    status: Optional[str] = "active"
    description: Optional[str] = None

class DisasterEventCreate(DisasterEventBase):
    latitude: float
    longitude: float

class DisasterEvent(DisasterEventBase):
    id: int
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DamageReportBase(BaseModel):
    damage_type: str
    severity: int
    description: Optional[str] = None
    source: str
    confidence: float
    verified: Optional[bool] = False

class DamageReportCreate(DamageReportBase):
    disaster_id: int
    latitude: float
    longitude: float

class DamageReport(DamageReportBase):
    id: int
    disaster_id: int
    latitude: float
    longitude: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    name: str
    resource_type: str
    status: Optional[str] = "available"
    capacity: int
    current_load: Optional[int] = 0

class ResourceCreate(ResourceBase):
    latitude: float
    longitude: float

class Resource(ResourceBase):
    id: int
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    task_type: str
    priority: int
    status: Optional[str] = "pending"
    assigned_resources: Optional[str] = None
    estimated_duration: Optional[int] = None

class TaskCreate(TaskBase):
    disaster_id: int
    latitude: float
    longitude: float

class Task(TaskBase):
    id: int
    disaster_id: int
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AgentUpdate(BaseModel):
    agent_type: str
    status: str
    message: str
    data: Optional[dict] = None