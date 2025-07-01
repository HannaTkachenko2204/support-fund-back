import { RequestHandler } from 'express';
import { db } from '../../db';
import { hashPassword } from '../../services/auth.service';

export const resetPasswordController: RequestHandler = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const userResult = await db.query(
      `SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
      [token]
    );

    if (userResult.rows.length === 0) {
      res.status(400).json({ message: 'Токен недійсний або прострочений' });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.query(
      `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = $2`,
      [hashedPassword, token]
    );

    res.json({ message: 'Пароль успішно оновлено' });
  } catch (err) {
    next(err);
  }
};
