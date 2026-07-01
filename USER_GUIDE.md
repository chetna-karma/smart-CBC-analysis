# Smart CBC - Step-by-Step User & Developer Guide

Welcome to the **Smart CBC Analysis and Health Suggestion System**! This application provides instant analysis of Complete Blood Count (CBC) report parameters, displays historical health trends, and supplies personalized dietary recommendations.

Follow the instructions below to set up and run the project, and explore its features step-by-step.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
* **Python 3.10 or newer** (with `pip` package manager).
* A modern web browser (Google Chrome, Microsoft Edge, Safari, or Mozilla Firefox).

---

## 🚀 Setup & Installation Instructions

### 1. Install Backend Dependencies
Open your command prompt or terminal in the project directory (`CBC`) and install the required Python packages:

```bash
pip install -r requirements.txt
```

*Note: In some systems, you might need to run `pip3 install -r requirements.txt` or execute it within a virtual environment.*

### 2. Launch the Application
Start both the Flask backend server and the frontend HTTP server with a single run command:

```bash
python run.py
```

This script will automatically:
1. Spin up the Flask backend API server on **`http://127.0.0.1:5000`**.
2. Run the frontend HTTP server on **`http://localhost:8080`**.
3. Open your default web browser directly to the homepage.

---

## 🩸 Step-by-Step Usage Guide

### Step 1: Browse the Landing Page
Once the app loads in your browser (`http://localhost:8080`), explore the premium landing page featuring:
* A CSS-animated blood cell illustration on the hero header.
* Animated statistics counters indicating reports processed, active users, and system metrics.
* Frequently Asked Questions (FAQ) accordion dropdown answers.

---

### Step 2: Create a Patient Profile
To unlock the analytical tracking and history features, you must register a patient profile:
1. Click the **Register** button in the navigation bar.
2. Fill in your **Full Name**, **Email Address**, and a secure **Password** (min. 6 characters).
3. Submit the registration form.
4. **Auto-Login UX**: The system will automatically log you in, establish secure authentication tokens, and redirect you directly to your **Dashboard**.

---

### Step 3: Explore the Dashboard
Your dashboard provides a high-level clinical overview:
* **Total Analyses**: Metrics logging the count of CBC reports run.
* **Risk Distribution**: Counters categorized by Low, Medium, and High risk profiles.
* **Latest Clinical Status**: Local clinical summaries.
* **Latest Health Score Gauge**: A circular gauge showing your most recent blood score.
* **Analytical History Trends**: An interactive ApexCharts graph mapping parameters (Hemoglobin, WBC, Platelets, RBC, MCV) across customizable timeframes.

---

### Step 4: Perform a Complete Blood Count (CBC) Analysis
To run a new blood analysis:
1. Click **New Analysis** in the header navbar or dashboard buttons.
2. Complete the **3-step Parameter Wizard**:
   * **Step 1 (Oxygen Carrier)**: Slide or type your **Hemoglobin (g/dL)** and **Red Blood Cells (M/µL)** values.
   * **Step 2 (Immunology & Clotting)**: Set your **White Blood Cells (/µL)** and **Platelet Count (/µL)** values.
   * **Step 3 (Morphology)**: Provide your **Mean Corpuscular Volume (MCV) (fL)** value.
3. Click **Generate Health Suggestion** to trigger the AI parser logic.

---

### Step 5: Review the Health Report
Your analysis results are immediately rendered in a premium medical report:
* **Overall Health Score**: Displays a percentage (0-100%) checking flag parameters.
* **Local Summary & Key Guidelines**: Details structural deviations and dietary improvements (e.g. iron, folate, or vitamin C baseline targets).
* **Parameters Breakdown**: Highlights status flags (Low, Normal, High) on colored progress bar tracks showing your value against normal reference boundaries.
* **Export PDF**: Click the **Download PDF** button to export a clean, printable medical report including patient metadata and parameters explanation grids.

---

### Step 6: Browse & Filter Report History
To review past logs:
1. Navigate to the **History** tab in the navbar.
2. Search reports using the input search bar to check summary text.
3. Filter reports by **Risk Categories** (Low Risk, Moderate, High Risk) or view **Favorites Only** by toggling favorites stars (`★`).
4. Click **View** on any row to open the details modal, or **Delete** to permanently purge it from the database.
5. Export your filtered report entries as a **CSV** sheet or generate an aggregated **PDF History log**.

---

### Step 7: Update Profile Settings
1. Click **Profile** in the navbar.
2. Review your Monogram Avatar, Monitored email details, and lifetime analysis counts.
3. Modify your Name, Email, or update your security Password.
4. Click **Save Changes** to instantly renew session tokens and update the navbar greeting message.
