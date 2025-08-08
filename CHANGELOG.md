# Changelog

All notable changes to the AIDR project will be documented in this file.

## [Latest Pull - August 8, 2025]

### Major Changes
**Moved from Docker to Local PostgreSQL Database** (Commit: 28f2811)
- Author: asad24-dev <asadmajeed2005@gmail.com>
- Date: Thu Aug 7 22:07:38 2025 +0100

### Added Files
- `backend/alembic/versions/4aab01913677_initial_migration_with_all_tables.py` - Database migration script (100 lines)
- `backend/create_tables_direct.py` - Direct table creation script (32 lines)
- `frontend/package-lock.json` - NPM lock file (4,237 lines)

### Modified Files
- `.gitignore` - Updated ignore patterns (29 line changes)
- `README.md` - Extensive documentation updates (132 line changes)
- `backend/app/main.py` - Minor configuration changes (4 line changes)
- `backend/requirements.txt` - Added new dependency (1 line addition)

### Removed Files
- `docker-compose.yml` - Docker configuration removed (22 lines deleted)
- `start_backend.bat` - Windows batch script removed (46 lines deleted)
- `start_backend.ps1` - PowerShell script removed (38 lines deleted)
- `start_frontend.bat` - Windows batch script removed (18 lines deleted)
- `start_frontend.ps1` - PowerShell script removed (17 lines deleted)
- `start_project.bat` - Windows batch script removed (82 lines deleted)
- `start_project.ps1` - PowerShell script removed (84 lines deleted)

### Summary Statistics
- **Total files changed:** 14
- **Lines added:** 4,496
- **Lines deleted:** 346
- **Net change:** +4,150 lines

### Key Changes Explained
1. **Database Migration:** The project has moved from Docker-based PostgreSQL to local PostgreSQL setup
2. **Platform Cleanup:** Removed all Windows-specific batch and PowerShell scripts
3. **Dependencies:** Added package-lock.json for better dependency management
4. **Database Schema:** Added proper Alembic migration for database tables
5. **Documentation:** Significantly updated README with new setup instructions

---

## Previous Changes

### [c5aecde] Update dependencies and refactor configuration settings
### [9a5e42f] Add project structure with backend and frontend components  
### [d000f2c] Update README.md
### [d5d9382] Update README.md
### [15c6258] Update README.md
### [3b31042] Initial commit

---

*This changelog is automatically generated. Last updated: August 8, 2025*
