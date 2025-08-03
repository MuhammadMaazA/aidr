import asyncio
import json
import openai
import httpx
from typing import List, Dict, Tuple
import os
from dotenv import load_dotenv
import random

load_dotenv()

class DamageAssessmentAgent:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.api_base_url = "http://localhost:8000/api/v1"
        
    async def send_agent_update(self, status: str, message: str, data: dict = None):
        """Send status update to the API"""
        async with httpx.AsyncClient() as client:
            try:
                await client.post(f"{self.api_base_url}/agent-update", json={
                    "agent_type": "damage_assessment",
                    "status": status,
                    "message": message,
                    "data": data or {}
                })
            except Exception as e:
                print(f"Failed to send agent update: {e}")
    
    async def get_damage_reports(self) -> List[Dict]:
        """Fetch all damage reports from the API"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.api_base_url}/damage-reports/")
                return response.json()
            except Exception as e:
                print(f"Failed to fetch damage reports: {e}")
                return []
    
    def analyze_damage_pattern(self, reports: List[Dict]) -> Dict:
        """Analyze patterns in damage reports to assess overall situation"""
        if not reports:
            return {"severity": "low", "confidence": 0.0, "analysis": "No damage reports available"}
        
        # Group reports by location proximity and damage type
        high_severity_reports = [r for r in reports if r.get("severity", 0) >= 7]
        verified_reports = [r for r in reports if r.get("verified", False)]
        
        prompt = f"""
        Analyze these damage reports for patterns and overall disaster impact:
        
        Total reports: {len(reports)}
        High severity reports (7+): {len(high_severity_reports)}
        Verified reports: {len(verified_reports)}
        
        Sample reports:
        {json.dumps(reports[:5], indent=2)}
        
        Provide analysis in JSON format:
        {{
            "overall_severity": "low|medium|high|critical",
            "primary_damage_types": ["array", "of", "damage", "types"],
            "affected_area_size": "small|medium|large|massive",
            "trend": "improving|stable|worsening",
            "critical_zones": [
                {{"latitude": float, "longitude": float, "severity": int, "description": "string"}}
            ],
            "recommended_actions": ["array", "of", "recommendations"],
            "confidence": float
        }}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            analysis = json.loads(response.choices[0].message.content)
            return analysis
        except Exception as e:
            print(f"Error analyzing damage patterns: {e}")
            return {
                "overall_severity": "unknown",
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def create_priority_tasks(self, analysis: Dict) -> List[Dict]:
        """Create priority tasks based on damage assessment"""
        tasks = []
        
        if analysis.get("overall_severity") in ["high", "critical"]:
            # Create high-priority rescue tasks for critical zones
            for zone in analysis.get("critical_zones", []):
                task = {
                    "disaster_id": 1,
                    "title": f"Emergency Response - {zone.get('description', 'Critical Zone')}",
                    "description": f"High priority response needed. Severity: {zone.get('severity', 'unknown')}",
                    "task_type": "rescue",
                    "priority": 5,
                    "latitude": zone.get("latitude", 40.7128),
                    "longitude": zone.get("longitude", -74.0060),
                    "estimated_duration": 180  # 3 hours
                }
                
                async with httpx.AsyncClient() as client:
                    try:
                        response = await client.post(f"{self.api_base_url}/tasks/", json=task)
                        tasks.append(response.json())
                    except Exception as e:
                        print(f"Failed to create task: {e}")
        
        # Create assessment tasks for medium severity areas
        if analysis.get("overall_severity") in ["medium", "high"]:
            for action in analysis.get("recommended_actions", []):
                task = {
                    "disaster_id": 1,
                    "title": f"Assessment Task: {action}",
                    "description": f"Recommended action based on damage assessment: {action}",
                    "task_type": "assessment",
                    "priority": 3,
                    "latitude": 40.7128 + random.uniform(-0.01, 0.01),  # Random nearby location
                    "longitude": -74.0060 + random.uniform(-0.01, 0.01),
                    "estimated_duration": 120  # 2 hours
                }
                
                async with httpx.AsyncClient() as client:
                    try:
                        response = await client.post(f"{self.api_base_url}/tasks/", json=task)
                        tasks.append(response.json())
                    except Exception as e:
                        print(f"Failed to create task: {e}")
                        break  # Only create one task to avoid spam
        
        return tasks
    
    async def run_assessment_cycle(self):
        """Run a complete damage assessment cycle"""
        await self.send_agent_update("active", "Damage Assessment Agent started")
        
        try:
            # Fetch all damage reports
            await self.send_agent_update("processing", "Fetching damage reports...")
            reports = await self.get_damage_reports()
            
            if not reports:
                await self.send_agent_update("waiting", "No damage reports found. Waiting for data...")
                return
            
            await self.send_agent_update("analyzing", f"Analyzing {len(reports)} damage reports...")
            
            # Analyze damage patterns
            analysis = self.analyze_damage_pattern(reports)
            
            await self.send_agent_update(
                "analysis_complete",
                f"Assessment complete. Overall severity: {analysis.get('overall_severity', 'unknown')}",
                {
                    "analysis": analysis,
                    "reports_analyzed": len(reports)
                }
            )
            
            # Create priority tasks if needed
            if analysis.get("overall_severity") in ["medium", "high", "critical"]:
                await self.send_agent_update("creating_tasks", "Creating priority tasks...")
                tasks = await self.create_priority_tasks(analysis)
                
                await self.send_agent_update(
                    "tasks_created",
                    f"Created {len(tasks)} priority tasks",
                    {"task_count": len(tasks)}
                )
            
        except Exception as e:
            await self.send_agent_update("error", f"Assessment error: {str(e)}")
        
        await self.send_agent_update("completed", "Damage assessment cycle completed")

async def main():
    agent = DamageAssessmentAgent()
    
    # Run assessment cycles every 60 seconds
    while True:
        await agent.run_assessment_cycle()
        await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(main())