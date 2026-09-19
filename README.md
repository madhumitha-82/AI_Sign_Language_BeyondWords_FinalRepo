# 🤟 BeyondWords: AI Sign Language Learning Platform

**BeyondWords** is a full-stack, AI-powered American Sign Language (ASL) learning platform. It empowers users to learn sign language interactively through a structured syllabus, quizzes, real-time AI computer vision recognition, and gamified progress tracking. 

## ✨ Key Features

- **🧠 Real-Time AI Sign Recognition:** Built with MediaPipe and XGBoost, the platform uses your webcam to instantly recognize ASL numbers and hand shapes, providing immediate feedback during practice.
- **📚 Structured Learning:** A rich syllabus with organized modules, interactive lessons, and high-quality ASL video demonstrations.
- **🏆 Gamification & Tracking:** Earn XP, unlock badges, level up, and compete on the global leaderboard as you complete quizzes and courses.
- **🛠️ Comprehensive Admin Dashboard:** Secure admin panel to manage users, add announcements, create new quizzes, upload videos, and monitor platform analytics.
- **🗣️ Speech-to-Text & Text-to-Speech:** Accessible communication tools bridging the gap between spoken and signed languages.

## 🏗️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **HTTP Client:** Axios

### Backend (Microservices)
- **Framework:** Java Spring Boot
- **Services:** `user-service`, `learning-service`, `analytics-service`
- **Security:** Spring Security & JWT Authentication
- **Database:** MySQL + Spring Data JPA (Hibernate)

### AI Model (Python Server)
- **Web Framework:** Flask
- **Computer Vision:** OpenCV & Google MediaPipe
- **Machine Learning:** Scikit-Learn & XGBoost (Joblib)

---

## 🚀 Getting Started

Follow these instructions to run the full-stack application on your local machine.

### 1. Prerequisites
- **Node.js** (v18+)
- **Java** (JDK 21)
- **Maven**
- **Python** (v3.10+)
- **MySQL Server** (Running on default port `3306`)

### 2. Database Setup
Create the required MySQL database schema:
```sql
CREATE DATABASE beyondwords_learning;
```
*(Hibernate will automatically generate the required tables upon starting the backend).*

### 3. Start the Backend Services (Java)
Navigate to each service directory and start them using Maven:

**User Service (Port 8081):**
```bash
cd Backend/user-service
mvn spring-boot:run
```
**Learning Service (Port 8082):**
```bash
cd Backend/learning-service
mvn spring-boot:run
```
**Analytics Service (Port 8083):**
```bash
cd Backend/analytics-service
mvn spring-boot:run
```

### 4. Start the AI Recognition Server (Python)
Ensure you have cloned the model artifacts to the correct directory, then start the Flask API.
```bash
cd ASL_Models
pip install -r requirements.txt
python server.py
```
*(Server will start on `http://localhost:5000`)*

### 5. Start the Frontend (React)
```bash
cd Frontend
npm install
npm run dev
```
*(Frontend will start on `http://localhost:5173`)*

---

## 🤝 Collaborators
- **Madhumitha** - Backend Development
- **Nivetha** - AI Model Training
- **Sangamithra** - Frontend Development

## 📜 License
This project is for educational and portfolio purposes.
