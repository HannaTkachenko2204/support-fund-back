import { User } from "../../types/user.types";
import { RequestHandler } from "express";
import { db } from "../../db";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../../services/auth.service";

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    // витягуємо email і password з тіла запиту (дані, які надіслав користувач)
    const { email, password } = req.body;
    // перевірка, що email і password не пусті
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    // запит до бази даних: вибираємо користувача з таблиці users за email
    const userResult = await db.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    // якщо користувач з таким email не знайдений — повертаємо помилку авторизації 401
    // userResult.rows — це масив користувачів, які відповідають запиту (має 0 або більше елементів)
    // Наприклад: [{ id: 1, name: 'Anna', email: 'anna@example.com', password: '***', ... }]
    if (userResult.rows.length === 0) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    // беремо об'єкт користувача з результату запиту
    const user: User = userResult.rows[0]; // взяти першого користувача з масиву rows (запит за email повинен повертати або 0, або 1 користувача)
    // порівнюємо пароль, який надійшов у запиті, з захешованим паролем з бази (функція comparePassword)
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    // генеруємо JWT токени з id користувача
    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Зберігаємо refresh токен в БД
    await db.query<User>("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.id,
    ]);
    // встановлюємо cookie з refresh токеном у відповідь клієнту
    // cookie httpOnly — недоступне з JS, secure — тільки по HTTPS, sameSite=strict — обмежує відправлення кукі стороннім сайтам
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
      })
      // відповідаємо клієнту JSON з користувачем (без пароля) і access токеном
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        accessToken,
      });
  } catch (err) {
    // якщо сталася будь-яка помилка — передаємо її в middleware обробки помилок Express через next
    next(err);
  }
};
