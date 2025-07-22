document.addEventListener('DOMContentLoaded', function () {
    // --- 获取所有需要的元素 ---
    const loginView = document.getElementById('login-view');
    const connectedView = document.getElementById('connected-view');

    const loginButton = document.querySelector('.btn-login');
    const usernameInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const instruction = document.querySelector('.instruction'); // 用户名提示信息

    const connectedUsername = document.querySelector('.user-info__name');
    const logoutButton = document.querySelector('.logout-box__button');
    const onlineTime = document.querySelector('.online_time');
    const usageProgressBar = document.querySelector('.usage-progress__bar');
    const usageProgressText = document.querySelector('.usage-progress__text');

    // --- 数据存储 ---
    const userData = {}; // 用于存储用户名和密码以及流量信息
    let timerInterval; // 用于存储计时器
    let usageInterval; // 用于存储流量计算器
    let seconds = 0;

    // --- 定义核心功能函数 ---

    function hideHintOnInput() {
        if (usernameInput.value) {
            instruction.classList.add('hidden');
        }
    }

    function startTimer() {
        const startTime = Date.now() - seconds * 1000;
        timerInterval = setInterval(() => {
            seconds = Math.floor((Date.now() - startTime) / 1000);
            const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            onlineTime.textContent = `${h}:${m}:${s}`;
        }, 1000);
    }

    function startUsageCalculation(username) {
        usageInterval = setInterval(() => {
            let currentUsage = userData[username].usage || 0;
            currentUsage += 3.33;
            userData[username].usage = Math.min(currentUsage, 50); // 最大50G
            updateUsageDisplay(username); // 实时更新进度条
        }, 1000);
    }

    function updateUsageDisplay(username) {
        const usage = userData[username].usage || 0;
        usageProgressBar.style.width = `${(usage / 50) * 100}%`;
        usageProgressText.textContent = `${usage.toFixed(2)}GB`;
    }


    // --- 绑定事件 ---

    // 1. 页面加载时，为用户名输入框绑定“一次性”的输入事件监听器
    usernameInput.addEventListener('input', hideHintOnInput, { once: true });

    // 2. 为登录按钮绑定点击事件
    loginButton.addEventListener('click', function (e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }

        // 检查用户是否存在
        if (userData[username]) {
            // 用户存在，检查密码
            if (userData[username].password !== password) {
                alert('密码错误！');
                return;
            }
        } else {
            // 新用户
            userData[username] = {
                password: password,
                usage: 0
            };
        }

        // 登录成功
        connectedUsername.textContent = username;
        loginView.classList.add('hidden');
        connectedView.classList.remove('hidden');

        // 设置初始时间和流量
        if (userData[username].usage > 0) {
            updateUsageDisplay(username);
        } else {
            usageProgressBar.style.width = `0%`;
            usageProgressText.textContent = `0.00GB`;
        }
        seconds = 0;
        onlineTime.textContent = '00:00:00';


        startTimer();
        startUsageCalculation(username);
    });

    // 3. 为登出按钮绑定点击事件
    logoutButton.addEventListener('click', function () {
        const username = connectedUsername.textContent;
        // 停止计时器和流量计算
        clearInterval(timerInterval);
        clearInterval(usageInterval);

        connectedView.classList.add('hidden');
        loginView.classList.remove('hidden');

        // 重置登录表单的状态
        passwordInput.value = '';
        usernameInput.value = '';
        instruction.classList.remove('hidden'); // 让提示信息重新显示
        // 再次为用户名输入框绑定“一次性”监听器，为下次登录做准备
        usernameInput.addEventListener('input', hideHintOnInput, { once: true });
    });

    // 4. 为输入框添加回车键支持
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                loginButton.click();
            }
        });
    });
});
