const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db'); // подключаем MySQL
const jwt = require('jsonwebtoken');

// Регистрация
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Проверка, существует ли пользователь
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Ошибка при поиске пользователя:', err);
                return res.status(500).json({ error: 'Ошибка сервера' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Email уже используется' });
            }

            // Хеширование пароля и добавление пользователя
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error('Ошибка при сохранении пользователя:', err);
                        return res.status(500).json({ error: 'Ошибка регистрации' });
                    }

                    res.status(201).json({ message: 'Пользователь зарегистрирован' });
                }
            );
        });
    } catch (err) {
        console.error('Ошибка в блоке try:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
