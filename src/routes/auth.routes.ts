import { Router } from "express";
import { registerController } from "../controllers/auth/register.controller";
import { loginController } from "../controllers/auth/login.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { refreshTokenController } from "../controllers/auth/refresh.controller";
import { logoutController } from "../controllers/auth/logout.controller";
import { currentController } from "../controllers/auth/current.controller";
import { forgotPasswordController } from "../controllers/auth/forgotPassword.controller";
import { resetPasswordController } from "../controllers/auth/resetPasswordController";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/refresh", refreshTokenController);

router.post('/logout', logoutController);

router.get('/current', authMiddleware, currentController);

router.post('/forgot-password', forgotPasswordController);

router.post('/reset-password', resetPasswordController);

export default router;
