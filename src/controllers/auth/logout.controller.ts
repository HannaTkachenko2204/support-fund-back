import { Request, Response } from 'express';
import { db } from '../../db';

export const logoutController = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(204).send();
    return;
  }

  const user = await db.query('SELECT id FROM users WHERE refresh_token = $1', [refreshToken]);
  if (user.rows.length > 0) {
    await db.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [user.rows[0].id]);
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};
