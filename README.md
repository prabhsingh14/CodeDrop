# 🚀 Vercel Backend Clone

A backend infrastructure clone of Vercel – built to simulate scalable deployment pipelines for frontend projects using containerization, queuing, and cloud-hosted services.

---

## 🛠 Tech Stack

- **Node.js** – Core API logic and services
- **Docker** – Containerized build & deployment pipeline
- **Redis** – In-memory queue for async job processing
- **AWS** – Infrastructure for deployment, storage, and scalability

---

## 📦 Features

- **🔄 Git Integration**: Automatically trigger builds from Git webhooks.
- **📦 Dockerized Builds**: Each project is built in an isolated Docker container to ensure environment parity and security.
- **🧵 Redis Queue System**: Build and deploy processes are managed using Redis-based asynchronous job queues.
- **📡 Dynamic Routing**: Every deployment gets a unique, dynamically routed endpoint.
- **☁️ Cloud Hosted**: Mimics production-level infrastructure using AWS services (EC2, S3, etc).

---

## 🚧 Architecture Overview

```txt
Client Repo Push --> Git Webhook --> Clone Repo --> Queue Build Job --> Docker Container Build --> Deploy to Cloud --> Return Live URL
