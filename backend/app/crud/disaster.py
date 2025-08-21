from sqlalchemy.orm import Session
from sqlalchemy import func, text
from ..models.disaster import DisasterEvent, DamageReport, Resource, Task
from ..schemas.disaster import (
    DisasterEventCreate, DamageReportCreate, ResourceCreate, TaskCreate
)
from geoalchemy2 import Geography

def create_disaster(db: Session, disaster: DisasterEventCreate):
    location = f"POINT({disaster.longitude} {disaster.latitude})"
    db_disaster = DisasterEvent(
        name=disaster.name,
        event_type=disaster.event_type,
        location=location,
        severity=disaster.severity,
        status=disaster.status,
        description=disaster.description
    )
    db.add(db_disaster)
    db.commit()
    db.refresh(db_disaster)
    
    # Add lat/lng for response
    db_disaster.latitude = disaster.latitude
    db_disaster.longitude = disaster.longitude
    return db_disaster

def get_disaster(db: Session, disaster_id: int):
    disaster = db.query(DisasterEvent).filter(DisasterEvent.id == disaster_id).first()
    if disaster:
        # Extract coordinates from geometry
        coord = db.execute(
            text(f"SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM disaster_events WHERE id = {disaster_id}")
        ).first()
        if coord:
            disaster.latitude = coord.lat
            disaster.longitude = coord.lng
    return disaster

def get_disasters(db: Session, skip: int = 0, limit: int = 100):
    disasters = db.query(DisasterEvent).offset(skip).limit(limit).all()
    for disaster in disasters:
        coord = db.execute(
            text(f"SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM disaster_events WHERE id = {disaster.id}")
        ).first()
        if coord:
            disaster.latitude = coord.lat
            disaster.longitude = coord.lng
    return disasters

def create_damage_report(db: Session, report: DamageReportCreate):
    location = f"POINT({report.longitude} {report.latitude})"
    db_report = DamageReport(
        disaster_id=report.disaster_id,
        location=location,
        damage_type=report.damage_type,
        severity=report.severity,
        description=report.description,
        source=report.source,
        confidence=report.confidence,
        verified=report.verified
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # Add lat/lng for response
    db_report.latitude = report.latitude
    db_report.longitude = report.longitude
    return db_report

def get_damage_reports(db: Session, skip: int = 0, limit: int = 100):
    reports = db.query(DamageReport).offset(skip).limit(limit).all()
    for report in reports:
        coord = db.execute(
            text(f"SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM damage_reports WHERE id = {report.id}")
        ).first()
        if coord:
            report.latitude = coord.lat
            report.longitude = coord.lng
    return reports

def create_resource(db: Session, resource: ResourceCreate):
    location = f"POINT({resource.longitude} {resource.latitude})"
    db_resource = Resource(
        name=resource.name,
        resource_type=resource.resource_type,
        location=location,
        status=resource.status,
        capacity=resource.capacity,
        current_load=resource.current_load
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    # Add lat/lng for response
    db_resource.latitude = resource.latitude
    db_resource.longitude = resource.longitude
    return db_resource

def get_resources(db: Session, skip: int = 0, limit: int = 100):
    resources = db.query(Resource).offset(skip).limit(limit).all()
    for resource in resources:
        coord = db.execute(
            text(f"SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM resources WHERE id = {resource.id}")
        ).first()
        if coord:
            resource.latitude = coord.lat
            resource.longitude = coord.lng
    return resources

def create_task(db: Session, task: TaskCreate):
    location = f"POINT({task.longitude} {task.latitude})"
    db_task = Task(
        disaster_id=task.disaster_id,
        title=task.title,
        description=task.description,
        task_type=task.task_type,
        priority=task.priority,
        status=task.status,
        assigned_resources=task.assigned_resources,
        location=location,
        estimated_duration=task.estimated_duration
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Add lat/lng for response
    db_task.latitude = task.latitude
    db_task.longitude = task.longitude
    return db_task

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    tasks = db.query(Task).offset(skip).limit(limit).all()
    for task in tasks:
        coord = db.execute(
            text(f"SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM tasks WHERE id = {task.id}")
        ).first()
        if coord:
            task.latitude = coord.lat
            task.longitude = coord.lng
    return tasks

def update_task_status(db: Session, task_id: int, status: str):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db_task.status = status
        db.commit()
        db.refresh(db_task)
        
        # Add coordinates
        coord = db.execute(
            text(f"SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM tasks WHERE id = {task_id}")
        ).first()
        if coord:
            db_task.latitude = coord.lat
            db_task.longitude = coord.lng
    return db_task

def assign_resources_to_task(db: Session, task_id: int, assigned_resources: str):
    """Assign resources to a task"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db_task.assigned_resources = assigned_resources
        db_task.status = "assigned"  # Update status to indicate resources are assigned
        db.commit()
        db.refresh(db_task)
        
        # Add coordinates
        coord = db.execute(
            text(f"SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM tasks WHERE id = {task_id}")
        ).first()
        if coord:
            db_task.latitude = coord.lat
            db_task.longitude = coord.lng
    return db_task