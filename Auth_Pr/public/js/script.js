document.addEventListener("DOMContentLoaded", function () {
    // Регистрация пользователя
    document.getElementById("register-form")?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm_password").value.trim();

        if (password !== confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        }

        if (!validatePassword(password)) {
            alert("Пароль должен содержать минимум 8 символов, включая цифры и символы разного регистра.");
            return;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, confirm_password: confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Регистрация успешна!");
                window.location.href = "login.html";
            } else {
                alert(data.error || "Ошибка регистрации.");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка. Попробуйте позже.");
        }
    });

    // Сброс пароля
    document.getElementById("reset-password-form")?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        try {
            const response = await fetch("/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Ссылка для сброса пароля отправлена на вашу почту.");
            } else {
                alert(data.error || "Ошибка при сбросе пароля.");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка. Попробуйте позже.");
        }
    });

    // Обновление пароля
    document.getElementById("update-password-form")?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const newPassword = document.getElementById("new_password").value.trim();

        if (!validatePassword(newPassword)) {
            alert("Пароль должен содержать минимум 8 символов, включая цифры и символы разного регистра.");
            return;
        }

        try {
            const response = await fetch("/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Пароль успешно обновлен!");
                window.location.href = "login.html";
            } else {
                alert(data.error || "Ошибка при обновлении пароля.");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка. Попробуйте позже.");
        }
    });
});

// Функция валидации пароля
function validatePassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return regex.test(password);
}
