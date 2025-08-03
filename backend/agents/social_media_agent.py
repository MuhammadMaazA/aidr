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
        2. What type of disaster is mentioned? (earthquake, flood, fire, etc.)
        3. What is the severity level? (1-10)
        4. Is there location information?
        5. What type of damage or situation is described?
        6. Confidence level in this assessment (0.0-1.0)
        
        Respond in JSON format:
        {{
            "is_disaster_related": boolean,
            "disaster_type": "string or null",
            "severity": integer or null,
            "location_mentioned": "string or null",
            "damage_type": "string or null",
            "confidence": float,
            "key_phrases": ["array", "of", "important", "phrases"]
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
        
        damage_report = {
            "disaster_id": 1,  # Assuming active disaster with ID 1
            "latitude": lat,
            "longitude": lng,
            "damage_type": analysis.get("damage_type", "unknown"),
            "severity": analysis.get("severity", 5),
            "description": f"Social media report: {post_text[:200]}...",
            "source": "social_media",
            "confidence": analysis.get("confidence", 0.5),
            "verified": False
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.api_base_url}/damage-reports/", json=damage_report)
                return response.json()
            except Exception as e:
                print(f"Failed to create damage report: {e}")
                return None
    
    async def monitor_social_media(self):
        """Main loop to monitor social media for disaster-related posts"""
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
                await asyncio.sleep(10)  # Wait 10 seconds between posts
                
                await self.send_agent_update("processing", f"Analyzing post {i+1}/{len(sample_posts)}")
                
                analysis = self.analyze_social_media_post(post)
                
                if analysis.get("is_disaster_related") and analysis.get("confidence", 0) > 0.5:
                    # Create damage report
                    report = await self.create_damage_report(analysis, post)
                    
                    if report:
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
                        await self.send_agent_update("low_confidence", f"Low confidence post: {post[:50]}...")
                else:
                    await self.send_agent_update("no_incident", f"Non-disaster post: {post[:50]}...")
                    
        except Exception as e:
            await self.send_agent_update("error", f"Agent error: {str(e)}")
        
        await self.send_agent_update("completed", "Social media monitoring cycle completed")

async def main():
    agent = SocialMediaAgent()
    await agent.monitor_social_media()

if __name__ == "__main__":
    asyncio.run(main())