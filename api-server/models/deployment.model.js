import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema({
    owner: {
        
    }
})

export default mongoose.model("Deployment", deploymentSchema);