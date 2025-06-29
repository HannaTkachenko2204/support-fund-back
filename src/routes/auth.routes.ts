import { Router } from 'express';
import { loginController, registerController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { db } from '../db';

const router = Router();

router.post('/register', registerController);

router.post('/login', loginController);

router.get('/current', authMiddleware, async (req, res) => {
    const userId = (req as any).userId;
    const result = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);
  
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
  
    res.json({ user: result.rows[0] });
  });

export default router;
