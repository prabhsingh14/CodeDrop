import Deployment from "../models/deployment.model.js";
import { buildProject } from "../utils/buildProject.js";
import { extractZip } from "../utils/extractZip.js";
import { hashFolder } from "../utils/hashFolder.js";
import fs from "fs";
import path from "path";

export const uploadZip = async (req, res) => {
    try {
        const { file } = req;
        const owner = req.user._id;
        const projectName = path.basename(file.originalname, ".zip");

        const extractTo = `./deployments/${projectName}-${Date.now()}`;
        
        extractZip(file.path, extractTo);
        const folderHash = await hashFolder(extractTo);
        
        // skip rebuild if nothing changed
        const existingDeployment = await Deployment.findOne({ owner, projectName });
        if(existingDeployment && existingDeployment.hash === folderHash){
            fs.unlinkSync(file.path); // remove the uploaded zip file
            return res.status(200).json({
                success: true,
                message: "No changes detected, deployment skipped",
                deployment: existingDeployment
            });
        }

        // build
        let buildLogs = "";
        try {
            buildLogs = await buildProject(extractTo);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Build failed",
                error: error.message,
            });
        }

        // create deployment record
        const deployment = new Deployment({
            owner,
            projectName,
            folderPath: extractTo,
            hash: folderHash,
        });

        fs.unlinkSync(file.path);
        await deployment.save();

        return res.status(200).json({
            success: true,
            message: "Deployment successful",
            deployment,
            buildLogs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not upload deployment",
            error: error.message,
        });
    }
}

export const toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const deployment = await Deployment.findById(id);
        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found",
            });
        }

        if(deployment.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: "You do not have permission to modify this deployment",
            });
        }

        deployment.isPublic = !deployment.isPublic;
        await deployment.save();

        return res.status(200).json({
            success: true,
            message: "Visibility toggled successfully",
            deployment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not toggle visibility",
            error: error.message,
        });
    }
}