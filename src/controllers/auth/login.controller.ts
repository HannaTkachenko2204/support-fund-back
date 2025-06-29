import { RequestHandler } from 'express';
import { db } from '../../db';
import { comparePassword, generateAccessToken, generateRefreshToken } from '../../services/auth.service';

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = userResult.rows[0];

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken({ id: user.id });
const refreshToken = generateRefreshToken({ id: user.id });

// Зберігаємо refresh токен в БД
await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    delete user.password;

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
      })
      .json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};