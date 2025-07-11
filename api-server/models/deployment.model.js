import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    folderPath: String, //where build lives
    hash: String, //for comparing the current deployment with the previous one
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("Deployment", deploymentSchema);