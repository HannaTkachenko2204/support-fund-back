import { User } from "../../types/user.types";
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

  const result = await db.query<User>(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const user: User = result.rows[0];
  res.json({ user });
};
