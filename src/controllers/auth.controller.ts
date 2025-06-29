import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { RequestHandler } from 'express';

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: newUser.rows[0], token });
  } catch (err) {
    next(err);
  }
};
