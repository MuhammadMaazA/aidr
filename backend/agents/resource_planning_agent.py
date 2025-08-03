import asyncio
import json
import openai
import httpx
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

class ResourcePlanningAgent:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.api_base_url = "http://localhost:8000/api/v1"
        
    async def send_agent_update(self, status: str, message: str, data: dict = None):
        """Send status update to the API"""
        async with httpx.AsyncClient() as client:
            try:
                await client.post(f"{self.api_base_url}/agent-update", json={
                    "agent_type": "resource_planning",
                    "status": status,
                    "message": message,
                    "data": data or {}
                })
            except Exception as e:
                print(f"Failed to send agent update: {e}")
    
    async def get_tasks(self) -> List[Dict]:
        """Fetch all tasks from the API"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.api_base_url}/tasks/")
                return response.json()
            except Exception as e:
                print(f"Failed to fetch tasks: {e}")
                return []
    
    async def get_resources(self) -> List[Dict]:
        """Fetch all resources from the API"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.api_base_url}/resources/")
                return response.json()
            except Exception as e:
                print(f"Failed to fetch resources: {e}")
                return []
    
    def optimize_resource_allocation(self, tasks: List[Dict], resources: List[Dict]) -> Dict:
        """Use AI to optimize resource allocation for tasks"""
        pending_tasks = [t for t in tasks if t.get("status") == "pending"]
        available_resources = [r for r in resources if r.get("status") == "available"]
        
        if not pending_tasks or not available_resources:
            return {
                "allocations": [],
                "efficiency": 0.0,
                "message": "No pending tasks or available resources"
            }
        
        prompt = f"""
        Optimize resource allocation for disaster response:
        
        PENDING TASKS ({len(pending_tasks)}):
        {json.dumps(pending_tasks, indent=2)}
        
        AVAILABLE RESOURCES ({len(available_resources)}):
        {json.dumps(available_resources, indent=2)}
        
        Create an optimal allocation plan considering:
        1. Task priority (1-5, where 5 is highest)
        2. Resource capacity and type matching
        3. Geographic proximity
        4. Resource efficiency
        
        Respond in JSON format:
        {{
            "allocations": [
                {{
                    "task_id": int,
                    "resource_ids": [array of resource IDs],
                    "efficiency_score": float,
                    "reasoning": "string explanation"
                }}
            ],
            "overall_efficiency": float,
            "unallocated_tasks": [array of task IDs that couldn't be allocated],
            "recommendations": ["array", "of", "optimization", "suggestions"]
        }}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            allocation_plan = json.loads(response.choices[0].message.content)
            return allocation_plan
        except Exception as e:
            print(f"Error optimizing allocation: {e}")
            return {
                "allocations": [],
                "overall_efficiency": 0.0,
                "error": str(e)
            }
    
    async def execute_allocation_plan(self, allocation_plan: Dict):
        """Execute the resource allocation plan"""
        allocations = allocation_plan.get("allocations", [])
        
        for allocation in allocations:
            task_id = allocation.get("task_id")
            resource_ids = allocation.get("resource_ids", [])
            
            # Update task with assigned resources
            async with httpx.AsyncClient() as client:
                try:
                    await client.put(
                        f"{self.api_base_url}/tasks/{task_id}",
                        params={"status": "in_progress"}
                    )
                    
                    await self.send_agent_update(
                        "task_assigned",
                        f"Task {task_id} assigned to resources {resource_ids}",
                        {
                            "task_id": task_id,
                            "resource_ids": resource_ids,
                            "efficiency": allocation.get("efficiency_score", 0)
                        }
                    )
                except Exception as e:
                    print(f"Failed to update task {task_id}: {e}")
    
    async def create_emergency_resources(self):
        """Create some emergency resources if none exist"""
        resources = await self.get_resources()
        
        if len(resources) < 3:  # Create some default resources
            emergency_resources = [
                {
                    "name": "Emergency Response Team Alpha",
                    "resource_type": "personnel",
                    "latitude": 40.7128,
                    "longitude": -74.0060,
                    "capacity": 10,
                    "status": "available"
                },
                {
                    "name": "Mobile Medical Unit",
                    "resource_type": "medical",
                    "latitude": 40.7589,
                    "longitude": -73.9851,
                    "capacity": 20,
                    "status": "available"
                },
                {
                    "name": "Heavy Rescue Equipment",
                    "resource_type": "equipment",
                    "latitude": 40.6892,
                    "longitude": -74.0445,
                    "capacity": 5,
                    "status": "available"
                }
            ]
            
            async with httpx.AsyncClient() as client:
                for resource in emergency_resources:
                    try:
                        await client.post(f"{self.api_base_url}/resources/", json=resource)
                        await self.send_agent_update(
                            "resource_created", 
                            f"Created emergency resource: {resource['name']}"
                        )
                    except Exception as e:
                        print(f"Failed to create resource: {e}")
    
    async def run_planning_cycle(self):
        """Run a complete resource planning cycle"""
        await self.send_agent_update("active", "Resource Planning Agent started")
        
        try:
            # Ensure we have some resources
            await self.create_emergency_resources()
            
            # Fetch current tasks and resources
            await self.send_agent_update("processing", "Fetching tasks and resources...")
            
            tasks = await self.get_tasks()
            resources = await self.get_resources()
            
            if not tasks:
                await self.send_agent_update("waiting", "No tasks found. Waiting for assignments...")
                return
            
            await self.send_agent_update(
                "optimizing", 
                f"Optimizing allocation for {len(tasks)} tasks and {len(resources)} resources..."
            )
            
            # Optimize resource allocation
            allocation_plan = self.optimize_resource_allocation(tasks, resources)
            
            if allocation_plan.get("allocations"):
                await self.send_agent_update(
                    "plan_ready",
                    f"Allocation plan ready. Efficiency: {allocation_plan.get('overall_efficiency', 0):.2f}",
                    {
                        "plan": allocation_plan,
                        "allocations_count": len(allocation_plan.get("allocations", []))
                    }
                )
                
                # Execute the allocation plan
                await self.send_agent_update("executing", "Executing resource allocation plan...")
                await self.execute_allocation_plan(allocation_plan)
                
                await self.send_agent_update(
                    "allocation_complete",
                    f"Successfully allocated resources to {len(allocation_plan.get('allocations', []))} tasks"
                )
            else:
                await self.send_agent_update("no_allocation", "No optimal allocations found")
                
        except Exception as e:
            await self.send_agent_update("error", f"Planning error: {str(e)}")
        
        await self.send_agent_update("completed", "Resource planning cycle completed")

async def main():
    agent = ResourcePlanningAgent()
    
    # Run planning cycles every 90 seconds
    while True:
        await agent.run_planning_cycle()
        await asyncio.sleep(90)

if __name__ == "__main__":
    asyncio.run(main())