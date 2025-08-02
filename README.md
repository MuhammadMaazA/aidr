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

## 🌪 The Problem

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
| **Deployment** | Docker, Google Cloud Run (Backend), Vercel (Frontend) |

### System Architecture

The system operates as a multi-agent collaborative, coordinated by the backend server.

`[Live Data Streams] -> [Information Gathering Agents] -> [Database] -> [Analysis & Planning Agents] -> [Command Center UI] -> [Human Decision] -> [Coordinated Action]`

## ⚙️ Getting Started (Local Setup)

Follow these instructions to get a local copy of Project AIDR up and running for development and testing.

### Prerequisites

- **Node.js**: `v18.0` or later
- **Python**: `v3.10` or later
- **Docker** & **Docker Compose**: For running the database
- **An OpenAI API Key**

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/project-aidr.git
    cd project-aidr
    ```

2.  **Set up Environment Variables:**
    You will need to create two `.env` files for your credentials.

    *   **Backend:** Create a file at `backend/.env` and add the following:
        ```env
        # backend/.env.example
        DATABASE_URL=postgresql://user:password@localhost:5432/aidr_db
        OPENAI_API_KEY="sk-..."
        ```
    *   **Frontend:** Create a file at `frontend/.env.local` and add your Mapbox token:
        ```env
        # frontend/.env.local.example
        VITE_MAPBOX_TOKEN="pk.eyJ..."
        ```

3.  **Setup Database:**
    The simplest way to run a local PostgreSQL + PostGIS database is with Docker.
    ```sh
    # From the root directory of the project
    docker-compose up -d
    ```
    *(Note: You will need to add a `docker-compose.yml` file for this. See an example [here](https://hub.docker.com/r/postgis/postgis/).)*

4.  **Setup Backend:**
    ```sh
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    alembic upgrade head      # To run database migrations
    ```

5.  **Setup Frontend:**
    ```sh
    cd frontend
    npm install
    ```

##  How to Run

1.  **Start the Database:** Make sure your Docker container for PostgreSQL is running.
    ```sh
    docker-compose up -d
    ```

2.  **Start the Backend Server:**
    ```sh
    cd backend
    source venv/bin/activate
    uvicorn app.main:app --reload
    ```
    The backend will be running on `http://127.0.0.1:8000`.

3.  **Start the Frontend Application:**
    In a new terminal:
    ```sh
    cd frontend
    npm run dev
    ```
    The frontend will be accessible at `http://127.0.0.1:5173`.

4.  **Run the AI Agents:**
    The agents are scripts that run alongside the server. In a new terminal:
    ```sh
    cd backend
    source venv/bin/activate
    python -m agents.social_media_agent  # To run the social media scan
    ```

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
