import { Request, Response } from 'express';
import { db } from '../../db';

interface AuthRequest extends Request {
  userId?: number;
}

export const currentController = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const result = await db.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({ user: result.rows[0] });
};
