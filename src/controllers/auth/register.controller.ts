import { RequestHandler } from 'express';
import { db } from '../../db';
import { hashPassword, generateAccessToken, generateRefreshToken } from '../../services/auth.service';

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    const accessToken = generateAccessToken({ id: newUser.rows[0].id });
const refreshToken = generateRefreshToken({ id: newUser.rows[0].id });

// Зберігаємо refresh токен в БД
await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, newUser.rows[0].id]);

res
  .cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // якщо HTTPS
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
  })
  .json({ user: newUser.rows[0], accessToken });
  } catch (err) {
    next(err);
  }
};