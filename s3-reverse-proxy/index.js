import express from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import Deployment from '../api-server/models/deployment.model.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected in reverse proxy"))
.catch(err => console.error("MongoDB error:", err));

app.use(async(req, res, next) => {
    const host = req.headers.host;
    const subdomain = host.split('.')[0]; //myapp.localhost
    if(!subdomain) return res.status(400).json({
        success: false,
        message: "Invalid request, no subdomain provided"
    });

    // find latest matching deployment
    const deployment = await Deployment.findOne({ projectName: subdomain }).sort({ createdAt: -1 });
    if(!deployment) return res.status(404).json({
        success: false,
        message: "Deployment not found"
    });

    // check if public or private
    if(!deployment.isPublic){
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) return res.status(401).json({
            success: false,
            message: "This deployment is private, no token provided"
        });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.id !== deployment.owner.toString()) {
                return res.status(403).send("You do not have access to this deployment.");
            }
        } catch (err) {
            return res.status(403).send("Invalid or expired token.");
        }
    }

    const staticPath = path.resolve(deployment.folderPath);
    if (!fs.existsSync(staticPath)) return res.status(404).send("Build folder missing");

    express.static(staticPath)(req, res, next);
})

app.listen(port, () => {
    console.log(`Reverse proxy server is running on http://localhost:${port}`);
});