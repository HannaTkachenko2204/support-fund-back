import { User } from "../../types/user.types";
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../db';
import { generateAccessToken, generateRefreshToken } from '../../services/auth.service';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const refreshTokenController: RequestHandler = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: 'No refresh token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: number };

    const result = await db.query<User>('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user || user.refresh_token !== refreshToken) {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await db.query<User>('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
