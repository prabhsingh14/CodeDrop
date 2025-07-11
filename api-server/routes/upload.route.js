import express from "express";
import multer from "multer";
import { uploadZip, toggleVisibility } from "../controllers/upload.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        if (!file.originalname.endsWith(".zip")) {
            return cb(new Error("Only zip files are allowed"));
        }
        cb(null, true);
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

router.post("/using-zip-folder", verifyJWT, upload.single("zip"), uploadZip);
router.post("/toggle-visibility/:id", verifyJWT, toggleVisibility);

export default router;