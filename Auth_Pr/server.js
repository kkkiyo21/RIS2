const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yourdatabase',
});

db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('✅ Подключение к базе данных успешно');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Проверка пароля
function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов, включая цифры и символы разного регистра.' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ error: 'Пароли не совпадают.' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка при хешировании пароля.' });
        }

        const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, email], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Ошибка при регистрации пользователя.' });
            }

            // Перенаправление на страницу входа
            res.json({ message: 'Регистрация успешна! Переход на страницу входа...', redirect: '/login.html' });
        });
    });
});

// Вход пользователя
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, users) => {
        if (err || users.length === 0) {
            return res.status(400).json({ error: 'Неверный email или пароль.' });
        }

        const user = users[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(400).json({ error: 'Неверный email или пароль.' });
            }

            // Генерация JWT токена
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            // Отправка списка пользователей
            const getAllUsersQuery = 'SELECT username, email FROM users';
            db.query(getAllUsersQuery, (err, allUsers) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при получении списка пользователей.' });
                }

                res.json({ message: 'Вход успешен!', token, users: allUsers });
            });
        });
    });
});

// Запрос на сброс пароля
app.post('/reset-password', (req, res) => {
    const { email } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, users) => {
        if (err || users.length === 0) {
            return res.status(400).json({ error: 'Пользователь с таким email не найден.' });
        }

        const user = users[0];
        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const updateQuery = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
        db.query(updateQuery, [resetToken, new Date(Date.now() + 3600000), email], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при обновлении токена.' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Сброс пароля',
                text: `Перейдите по следующей ссылке для сброса пароля: http://localhost:${port}/reset-password-form?token=${resetToken}`,
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при отправке письма.' });
                }
                res.json({ message: 'Ссылка для сброса пароля отправлена на вашу почту.' });
            });
        });
    });
});

// Обновление пароля
app.post('/update-password', (req, res) => {
    const { token, new_password } = req.body;

    if (!validatePassword(new_password)) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов, включая цифры и символы разного регистра.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: 'Токен недействителен или истек.' });
        }

        bcrypt.hash(new_password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при хешировании пароля.' });
            }

            const query = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?';
            db.query(query, [hashedPassword, decoded.id], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при обновлении пароля.' });
                }
                res.json({ message: 'Пароль успешно обновлен.' });
            });
        });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`🚀 Сервер работает на http://localhost:${port}`);
});
