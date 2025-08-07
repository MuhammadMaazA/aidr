# Project AIDR: Agent-driven Integrated Disaster Response

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/status-in_development-orange.svg)](https://github.com/your-username/project-aidr)

**A multi-agent AI platform for integrated disaster response. Built for the MIT Global Agents Hackathon.**


---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Live Demo](#-live-demo)
- [Tech Stack & Architecture](#️-tech-stack--architecture)
- [Getting Started (Local Setup)](#️-getting-started-local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [How to Run](#️-how-to-run)
- [Project Structure](#-project-structure)
- [Team Members](#-team-members)
- [License](#-license)

##  The Problem

In the critical first 72 hours after a major disaster, response efforts are defined by chaos. Information is fragmented across countless sources, communication networks are unreliable, and situational awareness for command centers is close to zero. This "information latency" costs time, resources, and ultimately, lives.

##  Our Solution

**Project AIDR (Agent-driven Integrated Disaster Response)** is a decision-support platform that transforms this chaos into clarity. We deploy a team of specialized AI agents that work collaboratively to ingest, analyze, and act on real-time data. The system provides a unified operational picture, allowing emergency commanders to make faster, more effective decisions when every second counts.

##  Key Features

- **Fuse Disparate Data Streams:** Agents autonomously ingest and structure data from social media, on-the-ground field reports, and simulated drone imagery.
- **Dynamic Damage Assessment:** An analysis agent creates and continuously updates a live "heat map" of the disaster zone, identifying critical areas, blocked routes, and clusters of activity.
- **Optimized Resource Allocation:** A planning agent analyzes the damage map and available resources to recommend the most effective deployment strategy, prioritizing the most critical needs.
- **Human-in-the-Loop Command:** The entire system is built as a tool for a human commander, who can override, approve, or adjust all AI-generated suggestions via a central, interactive dashboard.

##  Live Demo

Experience the AIDR dashboard in action!


## 🛠️ Tech Stack & Architecture

AIDR is built on a modern, scalable technology stack designed for real-time data processing and intelligence.

| Layer | Technology |
| :--- | :--- |
| **Backend / Agent Framework** | Python, FastAPI |
| **Frontend Dashboard** | React, TypeScript, Mapbox GL JS, Zustand |
| **AI / LLM Services**| OpenAI GPT-4 API |
| **Database** | PostgreSQL with PostGIS extension |
| **Real-time Communication** | WebSockets |
| **Deployment** | Local PostgreSQL, Vercel (Frontend), Heroku/Railway (Backend) |

### System Architecture

The system operates as a multi-agent collaborative, coordinated by the backend server.

`[Live Data Streams] -> [Information Gathering Agents] -> [Database] -> [Analysis & Planning Agents] -> [Command Center UI] -> [Human Decision] -> [Coordinated Action]`

## ⚙️ Getting Started (Local Setup)

Follow these instructions to get a local copy of Project AIDR up and running for development and testing.

### Prerequisites

- **Node.js**: `v18.0` or later
- **Python**: `v3.10` or later
- **PostgreSQL**: `v15` or later with PostGIS extension
- **An OpenAI API Key**

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/MuhammadMaazA/aidr.git
    cd aidr
    ```

2.  **Setup PostgreSQL Database:**
    
    **Install PostgreSQL (if not already installed):**
    - **Windows**: Download from [PostgreSQL Official Site](https://www.postgresql.org/download/windows/)
    - **macOS**: `brew install postgresql`
    - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

    **Install PostGIS Extension:**
    - **Windows**: Download PostGIS bundle from [PostGIS Downloads](https://postgis.net/windows_downloads/)
    - **macOS**: `brew install postgis`
    - **Linux**: `sudo apt-get install postgis postgresql-15-postgis-3`

    **Create Database and User:**
    ```sh
    # Connect to PostgreSQL (replace 'postgres' with your username if different)
    psql -U postgres
    
    # Create database and user
    CREATE DATABASE aidr_db;
    CREATE USER aidr_user WITH PASSWORD 'your_password_here';
    GRANT ALL PRIVILEGES ON DATABASE aidr_db TO aidr_user;
    
    # Connect to the new database
    \c aidr_db
    
    # Enable PostGIS extension
    CREATE EXTENSION IF NOT EXISTS postgis;
    
    # Exit psql
    \q
    ```

3.  **Set up Environment Variables:**
    You will need to create two `.env` files for your credentials.

    **Backend:** Create a file at `backend/.env`:
    ```env
    # Replace with your actual database password and OpenAI API key
    DATABASE_URL=postgresql://aidr_user:your_password_here@localhost:5432/aidr_db
    OPENAI_API_KEY="sk-your-openai-api-key-here"
    ```

    **Frontend:** Create a file at `frontend/.env.local`:
    ```env
    # Get your Mapbox token from https://account.mapbox.com/access-tokens/
    VITE_MAPBOX_TOKEN="pk.your-mapbox-token-here"
    ```

4.  **Setup Backend:**
    ```sh
    cd backend
    python -m venv venv
    
    # Activate virtual environment
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Install PostGIS support for Python
    pip install geoalchemy2
    
    # Create database tables
    python create_tables_direct.py
    ```

5.  **Setup Frontend:**
    ```sh
    cd frontend
    npm install
    ```

##  How to Run

1.  **Start the Backend Server:**
    ```sh
    cd backend
    # Activate virtual environment
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    uvicorn app.main:app --reload
    ```
    The backend will be running on `http://127.0.0.1:8000`.

2.  **Start the Frontend Application:**
    In a new terminal:
    ```sh
    cd frontend
    npm run dev
    ```
    The frontend will be accessible at `http://127.0.0.1:5173`.

3.  **Run the AI Agents:**
    The agents are scripts that run alongside the server. In a new terminal:
    ```sh
    cd backend
    # Activate virtual environment
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    python -m agents.social_media_agent  # To run the social media scan
    python -m agents.damage_assessment_agent  # To run damage analysis
    python -m agents.resource_planning_agent  # To run resource planning
    ```

## 🔧 Troubleshooting

### Database Connection Issues
- **PostgreSQL not running**: Start PostgreSQL service on your system
- **Password authentication failed**: Ensure the password in your `.env` file matches your PostgreSQL user password
- **PostGIS extension missing**: Run `CREATE EXTENSION IF NOT EXISTS postgis;` in your database

### Tables Not Created
If you encounter table-related errors, manually create tables:
```sh
cd backend
python create_tables_direct.py
```

### URL Encoding for Special Characters
If your PostgreSQL password contains special characters like `#`, `@`, `%`, etc., you need to URL encode them:
- `#` becomes `%23`
- `@` becomes `%40`
- `%` becomes `%25`

Example: If password is `mypass#123`, use `mypass%23123` in the DATABASE_URL.

## 📂 Project Structure

The project is organized with two primary packages: `backend` and `frontend`.

```
project-aidr/
├── backend/
│   ├── agents/         # Logic for each AI agent
│   ├── app/            # Core FastAPI application
│   │   ├── api/        # API endpoint definitions
│   │   ├── core/       # Configuration and database connection
│   │   ├── crud/       # Database create/read/update/delete logic
│   │   ├── models/     # SQLAlchemy ORM models
│   │   └── schemas/    # Pydantic data schemas
│   ├── tests/          # Pytest unit and integration tests
│   └── requirements.txt
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # Reusable React components (MapView, TaskQueue, etc.)
│       ├── hooks/      # Custom React hooks (e.g., useWebSocket)
│       └── state/      # Zustand store for global state management
├── .gitignore
├── LICENSE
└── README.md
```


## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
