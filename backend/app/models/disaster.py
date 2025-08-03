from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from geoalchemy2 import Geography
from ..core.database import Base

class DisasterEvent(Base):
    __tablename__ = "disaster_events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    event_type = Column(String)  # earthquake, hurricane, flood, etc.
    location = Column(Geography('POINT'))
    severity = Column(Integer)  # 1-10 scale
    status = Column(String, default="active")  # active, contained, resolved
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class DamageReport(Base):
    __tablename__ = "damage_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer)
    location = Column(Geography('POINT'))
    damage_type = Column(String)  # structural, infrastructure, human, etc.
    severity = Column(Integer)  # 1-10 scale
    description = Column(Text)
    source = Column(String)  # social_media, drone, field_report, etc.
    confidence = Column(Float)  # 0.0-1.0 confidence score
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    resource_type = Column(String)  # personnel, equipment, medical, etc.
    location = Column(Geography('POINT'))
    status = Column(String, default="available")  # available, deployed, maintenance
    capacity = Column(Integer)
    current_load = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(Integer)
    title = Column(String)
    description = Column(Text)
    task_type = Column(String)  # rescue, medical, logistics, etc.
    priority = Column(Integer)  # 1-5 scale
    status = Column(String, default="pending")  # pending, in_progress, completed
    assigned_resources = Column(Text)  # JSON array of resource IDs
    location = Column(Geography('POINT'))
    estimated_duration = Column(Integer)  # minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())