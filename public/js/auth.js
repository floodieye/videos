// auth.js

// Текущий режим работы формы
let currentForm = 'registration';
let recoveryEmail = '';
let codeSent = false;
let resendTimeout = null;
let resendSeconds = 60;

// DOM элементы
const registrationForm = document.getElementById('registration-form');
const authForm = document.getElementById('auth-form');
const recoveryForm = document.getElementById('recovery-form');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const sendCodeForm = document.getElementById('send-code-form');
const verifyCodeForm = document.getElementById('verify-code-form');

// Переключение между формами
function switchToRegistration() {
    registrationForm.classList.remove('hidden');
    authForm.classList.add('hidden');
    recoveryForm.classList.add('hidden');
    currentForm = 'registration';
    updateActiveTab();
    clearForms();
}

function switchToAuth() {
    registrationForm.classList.add('hidden');
    authForm.classList.remove('hidden');
    recoveryForm.classList.add('hidden');
    currentForm = 'auth';
    updateActiveTab();
    clearForms();
}

function switchToRecovery() {
    registrationForm.classList.add('hidden');
    authForm.classList.add('hidden');
    recoveryForm.classList.remove('hidden');
    sendCodeForm.classList.remove('hidden');
    verifyCodeForm.classList.add('hidden');
    currentForm = 'recovery';
    updateActiveTab();
    clearForms();
}

function updateActiveTab() {
    const regTab = document.querySelector('.auth-title h2:nth-child(1)');
    const authTab = document.querySelector('.auth-title h2:nth-child(2)');

    regTab.classList.remove('active');
    authTab.classList.remove('active');

    if (currentForm === 'registration') {
        regTab.classList.add('active');
    } else if (currentForm === 'auth') {
        authTab.classList.add('active');
    }
}

// Очистка форм
function clearForms() {
    if (currentForm === 'registration') {
        registerForm.reset();
    } else if (currentForm === 'auth') {
        loginForm.reset();
    } else if (currentForm === 'recovery') {
        sendCodeForm.reset();
        verifyCodeForm.reset();
        clearCodeInputs();
    }
}

function clearCodeInputs() {
    const codeInputs = document.querySelectorAll('.code-inputs input');
    codeInputs.forEach(input => {
        input.value = '';
    });
}

// Валидация форм
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Обработка отправки формы регистрации
registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const lastName = document.getElementById('reg-lastname').value;
    const firstName = document.getElementById('reg-firstname').value;

    // Валидация
    if (!validateEmail(email)) {
        alert('Пожалуйста, введите корректный email');
        return;
    }

    if (!validatePassword(password)) {
        alert('Пароль должен содержать минимум 8 символов');
        return;
    }

    try {
        // Имитация запроса к серверу
        const response = await mockApiCall('/register', {
            email,
            password,
            lastName,
            firstName
        });

        if (response.success) {
            alert('Регистрация прошла успешно! Теперь вы можете войти.');
            switchToAuth();
        } else {
            alert(response.message || 'Ошибка при регистрации');
        }
    } catch (error) {
        alert('Произошла ошибка при регистрации: ' + error.message);
    }
});

// Обработка отправки формы авторизации
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    // Валидация
    if (!validateEmail(email)) {
        alert('Пожалуйста, введите корректный email');
        return;
    }

    if (!validatePassword(password)) {
        alert('Пароль должен содержать минимум 8 символов');
        return;
    }

    try {
        // Имитация запроса к серверу
        const response = await mockApiCall('/login', {
            email,
            password
        });

        if (response.success) {
            alert('Вход выполнен успешно!');
            // Здесь можно перенаправить пользователя в личный кабинет
            // window.location.href = '/dashboard';
        } else {
            alert(response.message || 'Неверный email или пароль');
        }
    } catch (error) {
        alert('Произошла ошибка при авторизации: ' + error.message);
    }
});

// Обработка отправки формы восстановления пароля (запрос кода)
sendCodeForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    recoveryEmail = document.getElementById('recovery-email').value;

    if (!validateEmail(recoveryEmail)) {
        alert('Пожалуйста, введите корректный email');
        return;
    }

    try {
        // Имитация запроса к серверу
        const response = await mockApiCall('/send-recovery-code', {
            email: recoveryEmail
        });

        if (response.success) {
            codeSent = true;
            sendCodeForm.classList.add('hidden');
            verifyCodeForm.classList.remove('hidden');
            startResendTimer();
            alert('Код подтверждения отправлен на вашу почту');
        } else {
            alert(response.message || 'Ошибка при отправке кода');
        }
    } catch (error) {
        alert('Произошла ошибка при отправке кода: ' + error.message);
    }
});

// Обработка проверки кода и смены пароля
verifyCodeForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Получаем введенный код
    const codeInputs = document.querySelectorAll('.code-inputs input');
    let code = '';
    codeInputs.forEach(input => {
        code += input.value;
    });

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Проверка кода
    if (code.length !== 6) {
        document.getElementById('code-error').classList.remove('hidden');
        return;
    } else {
        document.getElementById('code-error').classList.add('hidden');
    }

    // Проверка пароля
    if (!validatePassword(newPassword)) {
        alert('Пароль должен содержать минимум 8 символов');
        return;
    }

    // Проверка совпадения паролей
    if (newPassword !== confirmPassword) {
        document.getElementById('password-error').classList.remove('hidden');
        return;
    } else {
        document.getElementById('password-error').classList.add('hidden');
    }

    try {
        // Имитация запроса к серверу
        const response = await mockApiCall('/reset-password', {
            email: recoveryEmail,
            code,
            newPassword
        });

        if (response.success) {
            alert('Пароль успешно изменен! Теперь вы можете войти с новым паролем.');
            switchToAuth();
        } else {
            document.getElementById('code-error').classList.remove('hidden');
            alert(response.message || 'Неверный код подтверждения');
        }
    } catch (error) {
        alert('Произошла ошибка при смене пароля: ' + error.message);
    }
});

// Функции для работы с кодом подтверждения
function moveToNext(input) {
    const index = parseInt(input.getAttribute('data-index'));
    const nextIndex = index + 1;

    if (input.value.length === 1 && nextIndex < 6) {
        document.querySelector(`.code-inputs input[data-index="${nextIndex}"]`).focus();
    }
}

function startResendTimer() {
    const resendLink = document.getElementById('resend-code');
    resendLink.classList.add('disabled');
    resendLink.textContent = `Отправить код повторно (${resendSeconds})`;

    resendTimeout = setInterval(() => {
        resendSeconds--;
        resendLink.textContent = `Отправить код повторно (${resendSeconds})`;

        if (resendSeconds <= 0) {
            clearInterval(resendTimeout);
            resendLink.classList.remove('disabled');
            resendLink.textContent = 'Отправить код повторно';
            resendSeconds = 60;
        }
    }, 1000);
}

function resendCode() {
    const resendLink = document.getElementById('resend-code');
    if (resendLink.classList.contains('disabled')) return;

    // Имитация повторной отправки кода
    mockApiCall('/resend-code', { email: recoveryEmail })
        .then(response => {
            if (response.success) {
                alert('Код отправлен повторно на вашу почту');
                startResendTimer();
            } else {
                alert(response.message || 'Ошибка при отправке кода');
            }
        })
        .catch(error => {
            alert('Произошла ошибка при отправке кода: ' + error.message);
        });
}

// Имитация API запросов
function mockApiCall(url, data) {
    return new Promise((resolve, reject) => {
        // Имитация задержки сети
        setTimeout(() => {
            // В реальном приложении здесь будет fetch или axios запрос
            let response;
            
            if (url === '/register') {
                response = {
                    success: true,
                    message: 'Регистрация успешна'
                };
            } else if (url === '/login') {
                // Тестовые учетные данные
                const testEmail = 'test@example.com';
                const testPassword = 'password123';
                
                if (data.email === testEmail && data.password === testPassword) {
                    response = {
                        success: true,
                        message: 'Авторизация успешна'
                    };
                } else {
                    response = {
                        success: false,
                        message: 'Неверный email или пароль'
                    };
                }
            } else if (url === '/send-recovery-code' || url === '/resend-code') {
                response = {
                    success: true,
                    message: 'Код отправлен'
                };
            } else if (url === '/reset-password') {
                // Тестовый код
                const testCode = '123456';
                
                if (data.code === testCode) {
                    response = {
                        success: true,
                        message: 'Пароль изменен'
                    };
                } else {
                    response = {
                        success: false,
                        message: 'Неверный код подтверждения'
                    };
                }
            } else {
                response = {
                    success: false,
                    message: 'Неизвестный запрос'
                };
            }
            
            resolve(response);
        }, 800);
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    // Очистка полей кода при загрузке
    clearCodeInputs();
    
    // Назначение обработчиков событий для табов
    document.querySelector('.auth-title h2:nth-child(1)').addEventListener('click', switchToRegistration);
    document.querySelector('.auth-title h2:nth-child(2)').addEventListener('click', switchToAuth);
    
    // Назначение обработчика для ссылки "Забыли пароль?"
    document.querySelector('.form-group a[onclick="switchToRecovery(); return false;"]').addEventListener('click', switchToRecovery);
    
    // Назначение обработчика для ссылки "Зарегистрируйтесь"
    document.querySelector('.footer-text a[onclick="switchToRegistration(); return false;"]').addEventListener('click', switchToRegistration);
    
    // Назначение обработчика для ссылки "Войти" в форме восстановления
    document.querySelector('#recovery-form .footer-text a[onclick="switchToAuth(); return false;"]').addEventListener('click', switchToAuth);
});