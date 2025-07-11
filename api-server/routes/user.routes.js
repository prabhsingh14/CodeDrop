import { Router } from 'express';
import { signup, login, logout, refreshAccessToken, getUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/signup").post(signup)
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyJWT, getUser)

export default router;