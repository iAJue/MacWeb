<template>
    <div class="login-container" :class="{ 'slide-up-exit': loginSuccess }">
        <div class="login-content" :class="{ 'content-success': loadingProgress >= 100 && verificationSuccess }">
            <div class="profile-image">
                <img src="/assets/profile.jpg" alt="用户头像" />
            </div>
            
            <div class="login-username">{{ username }}</div>
            
            <!-- 邀请码输入区域 -->
            <div v-if="!isVerifying && !verificationFailed && !verificationSuccess && !hasStoredValidInviteCode" class="invite-code-container">
                <input 
                    ref="inviteCodeInput"
                    v-model="inviteCode" 
                    class="invite-code-input" 
                    type="password" 
                    placeholder="请输入邀请码：MoeJue"
                    @keyup.enter="verifyInviteCode"
                />
                <button class="invite-code-button" @click="verifyInviteCode">
                    <svg viewBox="0 0 24 24" class="arrow-icon">
                        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                    </svg>
                </button>
            </div>
            
            <!-- 验证中 -->
            <div v-if="isVerifying" class="login-password-field">
                <div class="spinner-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <div class="login-text">验证中...</div>
            </div>
            
            <!-- 验证失败提示 -->
            <div v-if="verificationFailed" class="verification-message error">
                <div class="error-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                    </svg>
                </div>
                <span>邀请码不正确，请重试</span>
                <button class="retry-button" @click="resetVerification">重试</button>
            </div>
            
            <!-- 进度条 -->
            <div v-if="isVerifying" class="loading-progress">
                <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';
import { registerUser } from '@/utils/apiService';

// 定义组件属性
const props = defineProps({
    username: {
        type: String,
        default: 'Web AI'
    },
    isResourcesLoaded: {
        type: Boolean,
        default: false
    }
});

// 定义事件
const emit = defineEmits(['login-complete']);

// 邀请码相关状态
const inviteCode = ref('');
const inviteCodeInput = ref(null);
const isVerifying = ref(false);
const verificationFailed = ref(false);
const verificationSuccess = ref(false);
const hasStoredValidInviteCode = ref(false);
const CORRECT_INVITE_CODE = 'MoeJue'; // 正确的邀请码
const INVITE_CODE_STORAGE_KEY = 'valid_invite_code'; // 存储邀请码的键名

// 加载状态
const loadingProgress = ref(0);
// 登录成功状态，用于触发淡出动画
const loginSuccess = ref(false);

// 指纹相关
const browserFingerprint = ref('');

// 设置壁纸
const setWallpaper = () => {
    // 从本地存储加载保存的壁纸
    const savedWallpaper = localStorage.getItem('wallpaper') || 1;
    // 更新桌面背景样式
    const desktop = document.querySelector('.login-container');
    if (desktop) {
        desktop.style.backgroundImage = `url('/assets/wallpaper/${savedWallpaper}.jpg')`;
    }
};

// 检查本地存储中是否有有效的邀请码
const checkStoredInviteCode = () => {
    const storedCode = localStorage.getItem(INVITE_CODE_STORAGE_KEY);
    if (storedCode === CORRECT_INVITE_CODE) {
        hasStoredValidInviteCode.value = true;
        // 自动开始验证流程，跳过邀请码输入
        setTimeout(() => {
            inviteCode.value = CORRECT_INVITE_CODE;
            verifyInviteCode();
        }, 50);
    }
};

// 保存有效的邀请码到本地存储
const saveInviteCodeToStorage = (code) => {
    localStorage.setItem(INVITE_CODE_STORAGE_KEY, code);
};

// 获取浏览器指纹并存储
const getAndStoreFingerprint = async () => {
    try {
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        const visitorId = result.visitorId;
        localStorage.setItem('browserFingerprint', visitorId); 
        browserFingerprint.value = visitorId; 
        return visitorId;
    } catch (error) {
        console.error('获取浏览器指纹失败:', error);
        return null;
    }
};

// 注册用户
const tryRegisterUser = async (fingerprint, code) => {
    if (!fingerprint) {
        console.error('无法注册用户：缺少指纹');
        return false;
    }
    try {
        const response = await registerUser(fingerprint, code);
        if (response.success) {
            localStorage.setItem('auth_token', response.token);
        }
        return true; 
    } catch (error) {
        console.error('用户注册/验证失败:', error);
        return false;
    }
};

// 验证邀请码
const verifyInviteCode = async () => {
    if (inviteCode.value.trim() === '') return;

    // 确保已获取指纹
    if (!browserFingerprint.value) {
        await getAndStoreFingerprint();
        if (!browserFingerprint.value) {
            console.error("无法获取浏览器指纹，无法继续验证。");
            return;
        }
    }
    
    // 开始验证状态
    isVerifying.value = true;
    loadingProgress.value = 0; // 确保进度条从0开始
    
    // 启动加载进度条
    const isCorrectCode = inviteCode.value === CORRECT_INVITE_CODE;
    
    // 模拟后端验证（实际应该移除或替换）和注册
    let registrationSuccess = false;
    if (isCorrectCode) {
        registrationSuccess = await tryRegisterUser(browserFingerprint.value, inviteCode.value);
    }

    // 启动进度条动画
    simulateLoading(isCorrectCode && registrationSuccess);
    
    // 在进度到达一定程度后根据验证和注册结果显示
    setTimeout(() => {
        if (isCorrectCode && registrationSuccess) {
            verificationSuccess.value = true;
            // 保存有效邀请码到本地存储
            saveInviteCodeToStorage(inviteCode.value);
        } else {
            isVerifying.value = false;
            loadingProgress.value = 0;
            verificationFailed.value = true;
        }
    }, 500); // 调整延迟以匹配更快的进度条
};

// 重置验证状态
const resetVerification = () => {
    verificationFailed.value = false;
    loadingProgress.value = 0;
    inviteCode.value = '';
    isVerifying.value = false;
    // 清除可能正在运行的加载定时器
    if (window.loadingInterval) {
        clearInterval(window.loadingInterval);
        window.loadingInterval = null;
    }
    // 自动聚焦到输入框
    nextTick(() => {
        inviteCodeInput.value?.focus();
    });
};

// 模拟Mac登录加载过程
const simulateLoading = (isSuccess) => {
    // 清除可能存在的旧定时器
    if (window.loadingInterval) {
        clearInterval(window.loadingInterval);
    }

    const intervalId = setInterval(() => {
        const maxProgress = isSuccess ? 100 : 40; // 成功100，失败40
        
        if (loadingProgress.value < maxProgress) {
            if (loadingProgress.value < 30) {
                loadingProgress.value += Math.random() * 1.5 + 0.5;
            } else if (loadingProgress.value < 60) {
                loadingProgress.value += Math.random() * 1 + 0.3;
            } else if (loadingProgress.value < 90) {
                loadingProgress.value += Math.random() * 1.2 + 0.2;
            } else {
                loadingProgress.value += Math.random() < 0.3 ? 0.5 : 0;
            }
            if (loadingProgress.value > maxProgress) {
                loadingProgress.value = maxProgress;
            }
            
            // 失败时到达最大值停止
            if (!isSuccess && loadingProgress.value >= maxProgress) {
                clearInterval(intervalId);
                window.loadingInterval = null;
            }
        } else if (isSuccess && loadingProgress.value >= 100) {
            // 成功到达100%停止
            clearInterval(intervalId);
            window.loadingInterval = null;
            
            // 触发登录成功动画和事件
            loginSuccess.value = true;
            setTimeout(() => {
                emit('login-complete');
            }, 750);
        }
    }, 10); 

    window.loadingInterval = intervalId;
};

// 监听资源加载状态变化
watch(() => props.isResourcesLoaded, (newValue) => {
    if (newValue && isVerifying.value && loadingProgress.value < 60 && verificationSuccess.value) {
        // 当资源加载完成且进度条较低时，稍微加速进度
        loadingProgress.value = Math.max(loadingProgress.value, 60);
    }
});

// 组件加载完成后执行
onMounted(async () => {
    // 设置壁纸
    setWallpaper();
    // 尝试获取指纹
    await getAndStoreFingerprint(); 
    // 检查是否有存储的有效邀请码
    checkStoredInviteCode(); // checkStoredInviteCode 内部会调用 verifyInviteCode
    // 如果没有存储的邀请码，则自动聚焦到邀请码输入框
    if (!hasStoredValidInviteCode.value) {
        nextTick(() => {
            inviteCodeInput.value?.focus();
        });
    }
});
</script>

<style scoped>
/* Mac风格登录界面样式 */
.login-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    overflow: hidden;
    z-index: 1000;
    will-change: transform;
    transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.4, 1);
    z-index: 9999;
}

/* 登录成功上推退出动画 */
.login-container.slide-up-exit {
    transform: translateY(-100%);
}

/* 毛玻璃效果遮罩 */
.login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(30, 60, 114, 0.4);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
}

.login-content {
    text-align: center;
    padding: 30px;
    width: 300px;
    position: relative;
    z-index: 10;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease-out;
}

/* 登录成功时内容区域样式变化 */
.login-content.content-success {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.profile-image {
    margin: 0 auto 20px;
    width: 120px;
    height: 120px;
    border-radius: 60px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.8);
}

.content-success .profile-image {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
    border: 2px solid rgba(255, 255, 255, 1);
}

.profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.login-username {
    font-size: 22px;
    color: white;
    font-weight: 400;
    margin-bottom: 20px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 邀请码输入框样式 */
.invite-code-container {
    display: flex;
    align-items: center;
    margin: 15px auto 20px;
    width: 220px;
    position: relative;
}

.invite-code-input {
    width: 100%;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 10px;
    padding: 0 45px 0 15px;
    color: white;
    font-size: 16px;
    outline: none;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    transition: all 0.2s ease;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.invite-code-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.invite-code-input:focus {
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.invite-code-button {
    position: absolute;
    right: 0;
    top: 0;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    border-radius: 0 10px 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    opacity: 0.8;
    transition: all 0.2s ease;
}

.invite-code-button:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
}

.arrow-icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
}

.login-password-field {
    margin: 10px auto 20px;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    width: 220px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

.login-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 验证失败样式 */
.verification-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px auto 20px;
    padding: 15px;
    width: 220px;
    border-radius: 10px;
    background-color: rgba(255, 69, 58, 0.15);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

.error-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 8px;
}

.error-icon svg {
    fill: rgba(255, 69, 58, 0.9);
}

.verification-message span {
    font-size: 14px;
    color: white;
    margin-bottom: 12px;
}

.retry-button {
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 6px;
    padding: 6px 15px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.retry-button:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.spinner-dots {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
}

.dot {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    background-color: white;
    border-radius: 50%;
    opacity: 0.6;
    animation: dot-pulse 1.2s infinite ease-in-out;
}

.dot:nth-child(1) {
    animation-delay: 0s;
}

.dot:nth-child(2) {
    animation-delay: 0.4s;
}

.dot:nth-child(3) {
    animation-delay: 0.8s;
}

.loading-progress {
    height: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    width: 220px;
    margin: 20px auto 0;
}

.progress-bar {
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    transition: width 0.1s ease-out;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

@keyframes dot-pulse {
    0% {
        transform: scale(0.8);
        opacity: 0.4;
    }
    50% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(0.8);
        opacity: 0.4;
    }
}
</style> 