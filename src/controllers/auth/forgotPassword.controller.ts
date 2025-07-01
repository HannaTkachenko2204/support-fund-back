import { RequestHandler } from 'express';
import { db } from '../../db';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../../services/auth.service';

export const forgotPasswordController: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'Користувача не знайдено' });
      return;
    }

    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 година

    await db.query(
      `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3`,
      [resetToken, expires, email]
    );

    await sendEmail({
      to: email,
      subject: 'Відновлення паролю',
      text: `Перейдіть за посиланням, щоб скинути пароль: https://support-fund-front.vercel.app/reset-password?token=${resetToken}`,
    });

    res.json({ message: 'Лист для відновлення паролю надіслано' });
  } catch (err) {
    next(err);
  }
};
