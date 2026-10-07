import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authController as c } from '../controllers/auth.controller';

const router = Router();
router.post('/register', c.register);
router.get('/verify-email', c.verifyEmail);
router.post('/login', c.login);
router.get('/me', authenticate, c.me);
router.put('/profile', authenticate, c.updateProfile);
export default router;
