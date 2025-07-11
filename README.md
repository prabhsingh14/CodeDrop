# 🚀 CodeDrop: Vercel-Inspired Deployment Engine

A **scalable backend system** inspired by Vercel, enhanced with a unique feature:  
📦 Upload any `.zip` folder → ⚙️ Auto-build → 🌐 Deploy to subdomain → 🔐 Control visibility (public/private).

---

## 🛠 Tech Stack

- **Node.js** – Core backend logic
- **Docker** – Containerized build & deploy
- **Redis** – Async job queue (build + deployment)
- **MongoDB** – Deployment metadata store
- **AWS ECS** – Container orchestration (build tasks)
- **JWT Auth** – Access control for private builds
- **Multer** – File uploads

---

## 📦 Core Features

### 🔧 Project Deployment
- Upload `.zip` frontend → system builds it in Docker
- Only changed files are rebuilt (via content hashing)
- Auto-deploy to live subdomain (e.g., `yourapp.localhost:8000`)

### 🧠 Smart Build Diffing
- Skips unchanged files for blazing-fast rebuilds

### 🌐 Dynamic Subdomain Proxy
- Custom reverse proxy maps requests to correct deployment folder

### 🔐 Private/Public Access Control
- Toggle whether your deployed project is publicly visible or requires JWT-based auth

### 📁 Folder Structure
- `/api-server` → Auth, deployment logic, queue trigger
- `/build-server` → Docker builder image, file extraction, build
- `/s3-reverse-proxy` → Serves deployments by subdomain, with auth

---

## 🔮 Unique Feature: Zip-to-Live Deployment Engine

Unlike Vercel (which only supports Git-based triggers),  
this system allows developers to:

- Directly upload `.zip` builds
- Auto-deploy them on the fly
- Protect them with **JWT-auth gated subdomains**

---

## 🧪 Getting Started (Local Dev)

```bash
# Install dependencies
cd api-server && npm install
cd build-server && npm install
cd s3-reverse-proxy && npm install

# Start reverse proxy
cd s3-reverse-proxy && npm run dev
```
