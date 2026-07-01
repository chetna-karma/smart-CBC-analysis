# Smart CBC Report Analysis and Health Suggestion System

An advanced medical-themed, responsive web application designed to parse, validate, and analyze blood test parameters. It evaluates physiological thresholds, calculates overall risk levels, details parameter anomalies (Low/Normal/High), and supplies contextual nutrition/lifestyle suggestions.

---

## Technical Stack

* **Frontend**: HTML5, CSS3, TypeScript (compiled to browser-safe ES6 JavaScript). Responsive interface using custom CSS layouts and premium glassmorphic visual aesthetics.
* **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-Cors.
* **Database**: MySQL integration via PyMySQL, supporting a robust SQLite fallback.
* **Security**: Bcrypt password hashing, PyJWT authentication tokens, input sanitization, and Flask CORS validation headers.

---

## Folder Structure

```text
cbc/
├── backend/
│   ├── controllers/
│   │   ├── auth_controller.py
│   │   ├── dashboard_controller.py
│   │   └── report_controller.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── dashboard_routes.py
│   │   └── report_routes.py
│   ├── services/
│   │   ├── auth_service.py
│   │   └── cbc_analyzer.py
│   ├── utils/
│   │   ├── jwt_handler.py
│   │   └── validators.py
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql
│   └── setup_db.py
├── frontend/
│   ├── css/
│   │   ├── auth.css
│   │   ├── components.css
│   │   ├── dashboard.css
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── analysis.js
│   │   ├── history.js
│   │   └── main.js
│   ├── ts/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   ├── analysis.ts
│   │   ├── history.ts
│   │   └── main.ts
│   ├── about.html
│   ├── analyze.html
│   ├── dashboard.html
│   ├── history.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── tsconfig.json
├── README.md
├── requirements.txt
└── .gitignore
```

---

## Installation & Setup

### Prerequisites
1. **Python**: Version 3.8 or higher.
2. **TypeScript** (Optional, for compilation): Install globally using npm if editing source files: `npm install -g typescript`. (Compiled JavaScript is pre-provided under `frontend/js/` for out-of-the-box operation).

### Step 1: Install Dependencies
Run from the root directory to install required Python modules:
```bash
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Copy the `.env.example` in `backend/` to `.env` in the same directory:
```bash
cp backend/.env.example backend/.env
```
Inside `.env`, edit the settings:
* To use **SQLite** (automatic database creation, no server required):
  ```ini
  DB_TYPE=sqlite
  ```
* To use **MySQL**:
  ```ini
  DB_TYPE=mysql
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=yourpassword
  DB_NAME=cbc_analysis
  ```

### Step 3: Initialize the Database
Run the setup script from the root folder. If configured for MySQL, it will connect, create the schema database, and generate the table structures. If configured for SQLite, it creates a local file `backend/cbc_analysis.db`.
```bash
python database/setup_db.py
```

### Step 4: Run the Application
You can run the entire application (both the backend Flask server and the frontend server) with a single command:
```bash
python run.py
```
This script starts both servers simultaneously and automatically opens the application in your default web browser at `http://localhost:8080`.

Alternatively, to start them manually:
* Run backend: `python backend/app.py`
* Run frontend server: `python -m http.server 8080 --directory frontend`

---

## API Documentation

### Authentication

#### Register User
* **Endpoint**: `POST /api/auth/register`
* **Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Registration successful.",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2026-06-14T21:35:00"
    }
  }
  ```

#### Login User
* **Endpoint**: `POST /api/auth/login`
* **Payload**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

#### Get Current Profile
* **Endpoint**: `GET /api/auth/profile`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

---

### CBC Report Analyses (Protected routes)

#### Create Analysis Report
* **Endpoint**: `POST /api/reports`
* **Headers**: `Authorization: Bearer <token>`
* **Payload**:
  ```json
  {
    "hemoglobin": 11.2,
    "wbc": 6800,
    "platelets": 240000,
    "rbc": 4.8,
    "mcv": 88
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "CBC analysis generated and stored successfully.",
    "report": {
      "id": 1,
      "hemoglobin": 11.2,
      "wbc": 6800.0,
      "platelets": 240000.0,
      "rbc": 4.8,
      "mcv": 88.0,
      "risk_score": 15,
      "summary": "Your CBC report contains 1 abnormal parameter...",
      "recommendations": "For HEMOGLOBIN: Increase dietary iron intake...",
      "analysis": {
        "hemoglobin": {
          "value": 11.2,
          "min_ref": 12.0,
          "max_ref": 16.0,
          "status": "Low",
          "risk_level": "Medium",
          "explanation": "Low hemoglobin indicates anemia...",
          "recommendation": "Increase dietary iron intake..."
        },
        ...
      }
    }
  }
  ```

#### List Reports History
* **Endpoint**: `GET /api/reports`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  * `search`: Search query string matches against summary or recommendations content.
  * `risk`: Filter reports by risk bounds (`low`, `medium`, `high`).
  * `sort`: Sort output sequence (`newest`, `oldest`).
* **Response (200 OK)**:
  ```json
  {
    "reports": [
      {
        "id": 1,
        "hemoglobin": 11.2,
        "wbc": 6800.0,
        "platelets": 240000.0,
        "rbc": 4.8,
        "mcv": 88.0,
        "risk_score": 15,
        "summary": "...",
        "recommendations": "...",
        "created_at": "2026-06-14T21:35:00"
      }
    ]
  }
  ```

#### Get Detailed Report
* **Endpoint**: `GET /api/reports/<id>`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**: Returns the matching report record dictionary with full parameter breakdowns.

#### Delete Report
* **Endpoint**: `DELETE /api/reports/<id>`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "message": "Report deleted successfully."
  }
  ```

---

### Dashboard (Protected route)

#### Get Metrics Dashboard
* **Endpoint**: `GET /api/dashboard/stats`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "total_reports": 5,
    "recent_reports": [...],
    "health_summary": "Your latest CBC analysis indicates optimal health parameters...",
    "risk_indicators": {
      "low": 4,
      "medium": 1,
      "high": 0
    },
    "report_statistics": {
      "avg_hemoglobin": 13.1,
      "avg_wbc": 7100.2,
      "avg_platelets": 255000.0,
      "avg_rbc": 4.9,
      "avg_mcv": 89.2
    }
  }
  ```

---

## Run Verification Suite
Verify the endpoint operations by running the integrated test suite:
```bash
python backend/test_api.py
```

---

## Production Deployment Guide

This application is ready for production deployment across Render (Backend), Netlify (Frontend), and any MySQL Cloud Provider.

### 1. Database Setup (MySQL Cloud)
Use any cloud MySQL service (Aiven, Clever Cloud, AWS RDS, PlanetScale, etc.).
1. Create a MySQL database instance.
2. Run the database schema in [schema.sql](file:///C:/Users/Chetn/CBC/database/schema.sql) to provision tables, or let the backend setup script auto-generate them during setup.
3. Record the credentials: Host, Port (usually 3306), Username, Password, and Database Name (should be `CBD`).

### 2. Backend Deployment (Render)
1. Push the code to a GitHub repository.
2. Sign in to [Render](https://render.com/).
3. Click **New +** and select **Blueprint**.
4. Link your GitHub repository. Render will automatically read [render.yaml](file:///C:/Users/Chetn/CBC/render.yaml) and configure the Flask web service.
5. In the Render creation form, fill in the environment variables:
   - `DB_HOST`: Host address of your MySQL Cloud database.
   - `DB_USER`: Database username.
   - `DB_PASSWORD`: Database password.
   - `FRONTEND_URL`: URL of your Netlify frontend (e.g. `https://your-site.netlify.app`). This secures CORS policies.
6. Once the service builds, copy your Render Web Service URL (e.g. `https://smart-cbc-backend.onrender.com`).

### 3. Frontend Deployment (Netlify)
1. Sign in to [Netlify](https://www.netlify.com/).
2. Select **Add new site** > **Import an existing project** from GitHub.
3. Link the repository.
4. Set the build configurations:
   - **Base directory**: `frontend`
   - **Build command**: Leave blank (no compilation required for static pages).
   - **Publish directory**: `.` (or leave blank; hosts the static HTML and JS files).
5. Click **Deploy site**.
6. Copy your Netlify site URL (e.g., `https://your-site.netlify.app`) and configure it in Render's environment settings as `FRONTEND_URL`.

### 4. Bridge Frontend and Backend
By default, the frontend [api.js](file:///C:/Users/Chetn/CBC/frontend/js/api.js) automatically uses `https://smart-cbc-backend.onrender.com/api` as the production endpoint. 
If your Render service URL is different:
1. Open your Netlify hosted website.
2. Open the browser DevTools Console (F12).
3. Set your custom URL by running:
   ```javascript
   localStorage.setItem('CUSTOM_API_URL', 'https://<your-custom-render-app-name>.onrender.com/api');
   ```
4. Refresh the page. The app will now communicate with your custom backend.

