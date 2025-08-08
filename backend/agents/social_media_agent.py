import asyncio
import json
import openai
import httpx
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

class SocialMediaAgent:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.api_base_url = "http://localhost:8000/api/v1"
        
    async def send_agent_update(self, status: str, message: str, data: dict = None):
        """Send status update to the API"""
        print(f"🤖 Agent Update: [{status.upper()}] {message}")
        async with httpx.AsyncClient() as client:
            try:
                await client.post(f"{self.api_base_url}/agent-update", json={
                    "agent_type": "social_media",
                    "status": status,
                    "message": message,
                    "data": data or {}
                })
            except Exception as e:
                print(f"Failed to send agent update: {e}")
    
    def analyze_social_media_post(self, post_text: str) -> Dict:
        """Analyze a social media post for disaster-related information"""
        prompt = f"""
        Analyze this social media post for disaster-related information:
        
        "{post_text}"
        
        Determine:
        1. Is this disaster-related? (yes/no)
        2. What type of disaster is mentioned? (earthquake, flood, fire, storm, collapse, etc.)
        3. What is the severity level? (integer from 1-10, where 1=minor, 10=catastrophic)
        4. Is there location information?
        5. What type of damage or situation is described? (structural_damage, flooding, fire, debris, etc.)
        6. Confidence level in this assessment (float from 0.0-1.0)
        
        IMPORTANT: Always provide valid values, never use null.
        - severity must be an integer from 1-10
        - damage_type should be one of: structural_damage, flooding, fire, debris, power_outage, road_closure, unknown
        - If uncertain, use reasonable defaults
        
        Respond in JSON format:
        {{
            "is_disaster_related": true,
            "disaster_type": "earthquake",
            "severity": 7,
            "location_mentioned": "Main Street",
            "damage_type": "structural_damage",
            "confidence": 0.8,
            "key_phrases": ["building collapsed", "people trapped"]
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
            print(f"Error analyzing post: {e}")
            return {
                "is_disaster_related": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def create_damage_report(self, analysis: Dict, post_text: str, latitude: float = None, longitude: float = None):
        """Create a damage report based on social media analysis"""
        if not analysis.get("is_disaster_related") or analysis.get("confidence", 0) < 0.5:
            return None
            
        # Use default coordinates if none provided (e.g., city center)
        lat = latitude or 40.7128  # NYC coordinates as default
        lng = longitude or -74.0060
        
        # Ensure severity is a valid integer between 1-10
        severity = analysis.get("severity")
        if severity is None or not isinstance(severity, int) or severity < 1 or severity > 10:
            severity = 5  # Default severity
        
        # Ensure damage_type is not null/empty
        damage_type = analysis.get("damage_type") or "unknown"
        
        damage_report = {
            "disaster_id": 1,  # Assuming active disaster with ID 1
            "latitude": lat,
            "longitude": lng,
            "damage_type": damage_type,
            "severity": severity,
            "description": f"Social media report: {post_text[:200]}...",
            "source": "social_media",
            "confidence": analysis.get("confidence", 0.5),
            "verified": False
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.api_base_url}/damage-reports/", json=damage_report)
                response.raise_for_status()  # Raise an exception for bad status codes
                return response.json()
            except httpx.HTTPStatusError as e:
                print(f"HTTP error creating damage report: {e.response.status_code} - {e.response.text}")
                return None
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                return None
            except Exception as e:
                print(f"Failed to create damage report: {e}")
                return None
    
    async def monitor_social_media(self):
        """Main loop to monitor social media for disaster-related posts"""
        print("🤖 Social Media Agent starting...")
        await self.send_agent_update("active", "Social Media Agent started monitoring")
        
        # Simulated social media posts for demo
        sample_posts = [
            "Building collapsed on Main Street! People trapped inside! #earthquake",
            "Water rising fast in downtown area. Cars floating away #flood",
            "Power lines down everywhere after the storm. No electricity for miles",
            "Fire spreading through the forest near Highway 101. Evacuations ordered",
            "Beautiful sunset at the beach today! #vacation",
            "Emergency vehicles rushing to the shopping mall. Something big happened",
            "My house is severely damaged by the earthquake. Roof caved in completely"
        ]
        
        try:
            for i, post in enumerate(sample_posts):
                print(f"\n📱 Processing post {i+1}/{len(sample_posts)}: {post[:50]}...")
                await asyncio.sleep(10)  # Wait 10 seconds between posts
                
                await self.send_agent_update("processing", f"Analyzing post {i+1}/{len(sample_posts)}")
                
                print("🔍 Analyzing with OpenAI...")
                analysis = self.analyze_social_media_post(post)
                print(f"📊 Analysis result: {analysis}")
                
                if analysis.get("is_disaster_related") and analysis.get("confidence", 0) > 0.5:
                    # Create damage report
                    print("⚠️ Disaster-related content detected! Creating damage report...")
                    report = await self.create_damage_report(analysis, post)
                    
                    if report:
                        print(f"✅ Damage report created successfully! ID: {report.get('id')}")
                        await self.send_agent_update(
                            "found_incident", 
                            f"Disaster-related post detected: {analysis.get('disaster_type', 'unknown')}",
                            {
                                "post": post[:100],
                                "analysis": analysis,
                                "report_id": report.get("id")
                            }
                        )
                    else:
                        print("❌ Failed to create damage report")
                        await self.send_agent_update("low_confidence", f"Low confidence post: {post[:50]}...")
                else:
                    print("ℹ️ Non-disaster related post")
                    await self.send_agent_update("no_incident", f"Non-disaster post: {post[:50]}...")
                    
        except Exception as e:
            print(f"❌ Agent error: {str(e)}")
            await self.send_agent_update("error", f"Agent error: {str(e)}")
        
        print("🏁 Social media monitoring cycle completed")
        await self.send_agent_update("completed", "Social media monitoring cycle completed")

async def main():
    agent = SocialMediaAgent()
    await agent.monitor_social_media()

if __name__ == "__main__":
    asyncio.run(main())