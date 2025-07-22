# 清华大学校园网登录系统

一个模拟清华大学校园网登录界面的Web应用程序，实现了用户认证、连接时间统计、流量监控等功能。

## 项目概述

该项目完整复现了清华大学校园网的登录界面和已连接状态页面，包含用户名密码验证、实时连接时间显示、流量使用统计等核心功能。

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: 原生CSS，使用CSS变量和Flexbox布局
- **交互**: 纯JavaScript，无第三方依赖

## 项目结构

```
WebFinal/
├── index.html              # 主页面文件
├── static/
│   ├── css/
│   │   ├── custom.css      # 登录页面样式
│   │   └── connected.css   # 已连接页面样式
│   ├── js/
│   │   └── main.js         # 核心交互逻辑
│   └── images/             # 静态图片资源
│       ├── background/
│       ├── logo/
│       └── tsinghua/
└── README.md               # 项目说明文档
```

## 实现思路

### 1. 整体架构设计

项目采用单页面应用(SPA)架构，通过JavaScript控制两个主要视图的切换：
- **登录视图** (`#login-view`): 用户输入用户名和密码
- **已连接视图** (`#connected-view`): 显示连接状态和流量信息

## JavaScript核心实现逻辑详解

### 1. 代码结构组织

`main.js` 文件采用模块化设计，主要分为以下几个部分：

```javascript
document.addEventListener('DOMContentLoaded', function () {
    // 1. DOM元素获取
    // 2. 全局变量声明
    // 3. 核心功能函数定义
    // 4. 事件监听器绑定
});
```

#### 1.1 DOM元素获取策略
使用精确的选择器获取关键元素，确保代码的健壮性：
```javascript
// 视图容器
const loginView = document.getElementById('login-view');
const connectedView = document.getElementById('connected-view');

// 交互元素
const loginButton = document.querySelector('.btn-login');
const usernameInput = document.querySelector('input[type="text"]');
const passwordInput = document.querySelector('input[type="password"]');

// 显示元素
const connectedUsername = document.querySelector('.user-info__name');
const onlineTime = document.querySelector('.online_time');
const usageProgressBar = document.querySelector('.usage-progress__bar');
const usageProgressText = document.querySelector('.usage-progress__text');
```

#### 1.2 数据结构设计
采用对象存储用户数据，支持多用户管理：
```javascript
const userData = {}; // 主数据结构
// 结构示例:
// {
//   "user1": { password: "pass123", usage: 15.67 },
//   "user2": { password: "pass456", usage: 0 }
// }

let timerInterval;  // 计时器引用
let usageInterval;  // 流量计算器引用
let seconds = 0;    // 当前连接秒数
```

### 2. 核心算法实现

#### 2.1 高精度计时算法
避免累积误差的时间计算方法：
```javascript
function startTimer() {
    // 关键：使用基准时间戳，而非简单累加
    const startTime = Date.now() - seconds * 1000;
    
    timerInterval = setInterval(() => {
        // 每次都重新计算，避免累积误差
        seconds = Math.floor((Date.now() - startTime) / 1000);
        
        // 时间格式化：确保双位数显示
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        
        onlineTime.textContent = `${h}:${m}:${s}`;
    }, 1000);
}
```

**算法优势:**
- 基于绝对时间戳，避免定时器延迟累积
- 使用 `Math.floor` 确保整数秒显示
- `padStart(2, '0')` 保证格式一致性

#### 2.2 流量计算与限制算法
```javascript
function startUsageCalculation(username) {
    usageInterval = setInterval(() => {
        let currentUsage = userData[username].usage || 0;
        currentUsage += 3.33; // 每秒增加3.33GB
        
        // 关键：使用Math.min实现上限控制
        userData[username].usage = Math.min(currentUsage, 50);
        
        // 实时更新UI显示
        updateUsageDisplay(username);
    }, 1000);
}
```

**设计考虑:**

- 使用 `Math.min()` 优雅地处理上限问题
- 立即调用 `updateUsageDisplay()` 实现实时更新
- 容错处理：`|| 0` 确保初始值正确

#### 2.3 进度条可视化算法
```javascript
function updateUsageDisplay(username) {
    const usage = userData[username].usage || 0;
    
    // 百分比计算：流量/最大值 * 100%
    const percentage = (usage / 50) * 100;
    usageProgressBar.style.width = `${percentage}%`;
    
    // 数值显示：保留两位小数
    usageProgressText.textContent = `${usage.toFixed(2)}GB`;
}
```

**实现细节:**

- 动态宽度计算基于50GB上限
- `toFixed(2)` 确保显示精度
- CSS `transition` 属性提供平滑动画

### 3. 用户认证逻辑

#### 3.1 登录验证流程
```javascript
loginButton.addEventListener('click', function (e) {
    e.preventDefault(); // 阻止表单默认提交
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // 输入验证
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }

    // 用户存在性检查
    if (userData[username]) {
        // 老用户：密码验证
        if (userData[username].password !== password) {
            alert('密码错误！');
            return;
        }
    } else {
        // 新用户：创建记录
        userData[username] = {
            password: password,
            usage: 0
        };
    }

    // 登录成功：状态切换和初始化
    performLogin(username);
});
```

#### 3.2 状态管理机制
```javascript
function performLogin(username) {
    // 1. UI状态切换
    connectedUsername.textContent = username;
    loginView.classList.add('hidden');
    connectedView.classList.remove('hidden');

    // 2. 数据初始化
    if (userData[username].usage > 0) {
        // 老用户：恢复上次流量
        updateUsageDisplay(username);
    } else {
        // 新用户：从零开始
        usageProgressBar.style.width = '0%';
        usageProgressText.textContent = '0.00GB';
    }

    // 3. 计时器重置
    seconds = 0;
    onlineTime.textContent = '00:00:00';

    // 4. 启动监控
    startTimer();
    startUsageCalculation(username);
}
```

### 4. 事件处理机制

#### 4.1 智能提示系统
```javascript
function hideHintOnInput() {
    if (usernameInput.value) {
        instruction.classList.add('hidden');
    }
}

// 关键：使用 {once: true} 实现一次性监听
usernameInput.addEventListener('input', hideHintOnInput, { once: true });
```

**技术亮点:**
- `{once: true}` 选项确保监听器自动移除
- 避免重复绑定和内存泄漏
- 状态重置时重新绑定

#### 4.2 登出处理机制
```javascript
logoutButton.addEventListener('click', function () {
    const username = connectedUsername.textContent;
    
    // 1. 清理定时器（防止内存泄漏）
    clearInterval(timerInterval);
    clearInterval(usageInterval);

    // 2. 视图切换
    connectedView.classList.add('hidden');
    loginView.classList.remove('hidden');

    // 3. 表单重置
    passwordInput.value = '';
    usernameInput.value = '';
    instruction.classList.remove('hidden');
    
    // 4. 重新绑定事件监听器
    usernameInput.addEventListener('input', hideHintOnInput, { once: true });
});
```

#### 4.3 键盘快捷键支持
```javascript
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            loginButton.click(); // 触发登录按钮点击事件
        }
    });
});
```

### 5. 内存管理与性能优化

#### 5.1 定时器管理
```javascript
// 创建定时器时保存引用
timerInterval = setInterval(callback, 1000);
usageInterval = setInterval(callback, 1000);

// 页面切换时必须清理
clearInterval(timerInterval);
clearInterval(usageInterval);
```

#### 5.2 事件监听器生命周期
```javascript
// 避免重复绑定
function rebindUsernameListener() {
    // 移除可能存在的旧监听器（通过once: true自动处理）
    usernameInput.addEventListener('input', hideHintOnInput, { once: true });
}
```

### 6. 错误处理策略

#### 6.1 输入验证
```javascript
// 空值检查
if (!username || !password) {
    alert('请输入用户名和密码');
    return;
}

// 字符串清理
const username = usernameInput.value.trim();
```

#### 6.2 容错处理
```javascript
// 安全的属性访问
const usage = userData[username].usage || 0;

// DOM元素存在性检查（通过选择器精确性保证）
const element = document.querySelector('.specific-class');
if (element) {
    element.textContent = value;
}
```

### 7. 代码组织原则

1. **单一职责**: 每个函数只负责一个具体功能
2. **依赖注入**: 函数参数明确，避免隐式依赖
3. **状态集中**: 用户数据统一存储在 `userData` 对象
4. **事件驱动**: 通过事件监听器响应用户操作
5. **生命周期管理**: 明确资源的创建和清理时机

这种设计确保了代码的可维护性、可扩展性和性能表现。

## 核心功能模块概述

### 1. 用户认证系统
```javascript
// 用户数据结构
const userData = {
    [username]: {
        password: "用户密码",
        usage: 流量使用量(GB)
    }
}
```

**认证流程:**
1. 首次登录：记录用户名和密码，初始化流量为0
2. 再次登录：验证密码是否与首次登录时一致
3. 密码错误：弹出提示框阻止登录

#### 2. 连接时间统计
使用高精度时间戳实现秒级精确计时：
```javascript
function startTimer() {
    const startTime = Date.now() - seconds * 1000;
    timerInterval = setInterval(() => {
        seconds = Math.floor((Date.now() - startTime) / 1000);
        // 格式化为 HH:MM:SS 显示
    }, 1000);
}
```

#### 3. 流量监控系统
- **增长速率**: 3.33GB/秒
- **上限控制**: 最大50GB
- **实时更新**: 进度条和数值同步更新
- **持久化**: 断开连接后保存当前流量值

```javascript
function startUsageCalculation(username) {
    usageInterval = setInterval(() => {
        let currentUsage = userData[username].usage || 0;
        currentUsage += 3.33;
        userData[username].usage = Math.min(currentUsage, 50);
        updateUsageDisplay(username);
    }, 1000);
}
```

#### 4. 进度条可视化
- 分段式背景显示（0-20GB, 20-30GB, 30-40GB, 40-50GB）
- 动态宽度计算：`width = (usage / 50) * 100%`
- 渐变色彩效果增强视觉体验

## 用户交互优化

### 1. 智能提示系统
- 用户名输入框默认显示提示信息
- 首次输入时自动隐藏提示（使用 `{once: true}` 选项）
- 登出后重新显示提示，恢复初始状态

### 2. 键盘快捷操作
- 支持 Enter 键快速登录
- 适用于用户名和密码输入框

### 3. 状态管理
使用CSS类控制视图切换，确保状态一致性：
```javascript
// 登录成功
loginView.classList.add('hidden');
connectedView.classList.remove('hidden');

// 登出
connectedView.classList.add('hidden');
loginView.classList.remove('hidden');
```

## 使用说明

### 1. 环境要求
- 现代浏览器（支持ES6+）
- 本地Web服务器（推荐使用Live Server扩展）

### 2. 启动方式
1. 使用VS Code打开项目文件夹
2. 安装Live Server扩展
3. 右键点击`index.html`，选择"Open with Live Server"
4. 浏览器自动打开项目页面

### 3. 功能操作

#### 3.1 首次登录
1. 在用户名输入框中输入任意非空用户名
2. 在密码输入框中输入任意非空密码
3. 点击"连接"按钮或按Enter键
4. 成功跳转到已连接页面，开始计时和流量统计

#### 3.2 再次登录
1. 使用相同用户名登录时，必须输入与首次登录相同的密码
2. 密码正确：正常登录，显示上次断开时的流量值
3. 密码错误：弹出"密码错误！"提示框

#### 3.3 查看连接状态
- **连接时间**: 从00:00:00开始，每秒更新
- **已用流量**: 从上次记录值开始，每秒增加3.33GB
- **进度条**: 实时反映流量使用情况

#### 3.4 断开连接
1. 点击"断开连接"按钮
2. 自动保存当前流量值
3. 返回登录页面，重置输入框状态

## 遇到的问题及解决办法

### 1. 进度条实时更新问题

**问题描述**: 初始版本中，流量进度条只在登录和登出时更新，无法实时反映流量变化。

**解决方案**: 
在`startUsageCalculation`函数中添加`updateUsageDisplay`调用，确保每秒更新进度条：
```javascript
function startUsageCalculation(username) {
    usageInterval = setInterval(() => {
        let currentUsage = userData[username].usage || 0;
        currentUsage += 3.33;
        userData[username].usage = Math.min(currentUsage, 50);
        updateUsageDisplay(username); // 关键：实时更新显示
    }, 1000);
}
```

### 2. 事件监听器重复绑定问题

**问题描述**: 登出后再次登录时，用户名输入框的提示隐藏功能失效。

**解决方案**: 
使用`{once: true}`选项确保监听器只执行一次，并在登出时重新绑定：
```javascript
// 登出时重新绑定一次性监听器
usernameInput.addEventListener('input', hideHintOnInput, { once: true });
```

### 3. 流量数据持久化问题

**问题描述**: 需要在用户断开连接后保存流量数据，再次登录时恢复。

**解决方案**: 
使用JavaScript对象`userData`存储用户数据，区分首次登录和再次登录：
```javascript
// 新用户：初始化流量为0
userData[username] = {
    password: password,
    usage: 0
};

// 老用户：保持原有流量值
if (userData[username].usage > 0) {
    updateUsageDisplay(username);
}
```

### 4. 计时器精度问题

**问题描述**: 简单的累加计时可能存在误差累积。

**解决方案**: 
使用基准时间戳计算，避免误差累积：
```javascript
function startTimer() {
    const startTime = Date.now() - seconds * 1000;
    timerInterval = setInterval(() => {
        seconds = Math.floor((Date.now() - startTime) / 1000);
        // 每次都基于起始时间计算，避免累积误差
    }, 1000);
}
```

### 5. CSS样式冲突问题

**问题描述**: 两个页面的样式文件可能存在选择器冲突。

**解决方案**: 
- 使用CSS变量统一色彩方案
- 采用BEM命名规范避免类名冲突
- 分离登录页面和已连接页面的样式文件

### 6. 内存泄漏问题

**问题描述**: 页面切换时定时器未正确清理，可能导致内存泄漏。

**解决方案**: 
在登出时明确清理所有定时器：
```javascript
logoutButton.addEventListener('click', function () {
    clearInterval(timerInterval);
    clearInterval(usageInterval);
    // 其他清理逻辑...
});
```

## 项目特色

1. **高保真还原**: 完全复现清华大学校园网的视觉设计和交互逻辑
2. **响应式设计**: 适配不同屏幕尺寸，提供良好的移动端体验
3. **无依赖实现**: 纯原生技术栈，无需外部库和框架
4. **用户体验优化**: 智能提示、键盘快捷键、实时反馈等细节优化
5. **代码结构清晰**: 模块化设计，易于维护和扩展

## 未来改进方向

1. **数据持久化**: 使用localStorage保存用户数据
2. **动画效果**: 添加页面切换和进度条动画
3. **错误处理**: 完善异常情况的处理逻辑
4. **安全性**: 添加输入验证和XSS防护
5. **性能优化**: 使用requestAnimationFrame优化动画性能

## 总结

本项目成功实现了一个功能完整的校园网登录系统模拟器，通过合理的架构设计和细致的问题解决，提供了良好的用户体验。项目代码结构清晰，易于理解和维护，为后续的功能扩展奠定了良好的基础。
