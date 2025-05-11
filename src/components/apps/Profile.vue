<template>
    <MacWindow
        title="个人中心"
        :isMinimized="isMinimized"
        width="480"
        height="600"
        @close="closeWindow"
        @minimize="minimizeWindow"
    >
        <div class="window-content">
            <div class="loading-container" v-if="loading">
                <div class="mac-spinner"></div>
                <p>正在加载用户信息...</p>
            </div>
            <div class="profile-container" v-else>
                <div class="profile-header">
                    <div class="avatar">
                        <img :src="avatarUrl" alt="用户头像">
                    </div>
                    <div class="user-info">
                        <h2>{{ userInfo.username || '未设置用户名' }}</h2>
                        <div class="member-badge" :class="memberLevelClass">
                            {{ memberLevelText }}
                        </div>
                    </div>
                    <button class="sign-in-btn" @click="openSignInModal">
                        <span class="sign-in-icon">📅</span>
                        立即签到
                    </button>
                </div>
                
                
                <div class="info-section">
                    <h3>基本信息</h3>
                    <div class="info-row">
                        <span class="label">邮箱：</span>
                        <span class="value">{{ userInfo.email || '未绑定邮箱' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">注册时间：</span>
                        <span class="value">{{ formatDate(userInfo.registrationDate) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">上次登录：</span>
                        <span class="value">{{ formatDate(userInfo.lastLoginDate) }}</span>
                    </div>
                </div>
                
                <div class="credits-section">
                    <h3>积分信息</h3>
                    <div class="credits-container">
                        <div class="credit-card">
                            <div class="credit-icon">🎁</div>
                            <div class="credit-amount">{{ userInfo.freeCredits || 0 }}</div>
                            <div class="credit-label">免费积分</div>
                        </div>
                        <div class="credit-card">
                            <div class="credit-icon">💎</div>
                            <div class="credit-amount">{{ userInfo.paidCredits || 0 }}</div>
                            <div class="credit-label">付费积分</div>
                        </div>
                    </div>
                </div>

                <div class="actions-section">
                    <button class="mac-btn primary" v-if="!userInfo.email" @click="showBindEmailDialog">
                        绑定邮箱
                    </button>
                    <button class="mac-btn" @click="refreshUserInfo">
                        刷新信息
                    </button>
                </div>

                <div class="error-message" v-if="error">
                    {{ error }}
                </div>
            </div>
        </div>
    </MacWindow>

    <!-- 签到弹窗 -->
    <SignInModal v-model:visible="showSignInModal"/>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getCurrentUser } from '@/utils/apiService';
import { ElMessage } from 'element-plus';
import MacWindow from '@/components/common/MacWindow.vue';
import SignInModal from '@/components/system/SignInModal.vue';

// 组件属性
const props = defineProps({
    isMinimized: {
        type: Boolean,
        default: false
    }
});

// 事件
const emit = defineEmits(['close', 'minimize']);

// 用户信息状态
const userInfo = ref({});
const loading = ref(true);
const error = ref('');

// 签到弹窗显示状态
const showSignInModal = ref(false);

// 计算头像URL
const avatarUrl = computed(() => {
    return userInfo.value.avatarUrl || '/assets/profile.jpg';
});

// 计算会员等级样式
const memberLevelClass = computed(() => {
    const level = userInfo.value.memberLevel || 0;
    if (level === 0) return 'free';
    if (level === 1) return 'basic';
    if (level === 2) return 'premium';
    return 'vip';
});

// 计算会员等级文本
const memberLevelText = computed(() => {
    const level = userInfo.value.memberLevel || 0;
    if (level === 0) return '免费用户';
    if (level === 1) return '基础会员';
    if (level === 2) return '高级会员';
    return '专业会员';
});

// 获取用户信息
const fetchUserInfo = async () => {
    loading.value = true;
    error.value = '';
    
    try {
        const response = await getCurrentUser();
        if (response.success) {
            userInfo.value = response.user;
        } else {
            error.value = response.message || '获取用户信息失败';
        }
    } catch (err) {
        console.error('获取用户信息出错:', err);
        error.value = '网络错误，请稍后再试';
    } finally {
        loading.value = false;
    }
};

// 日期格式化
const formatDate = (dateString) => {
    if (!dateString) return '未知';
    
    try {
        const timestamp = parseInt(dateString);
        const date = isNaN(timestamp) ? new Date(dateString) : new Date(timestamp * 1000);
        
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
};

// 绑定邮箱对话框（暂时只显示提示）
const showBindEmailDialog = () => {
    ElMessage.warning('邮箱绑定功能正在开发中...');
};

// 打开签到弹窗
const openSignInModal = () => {
    showSignInModal.value = true;
};

// 刷新用户信息
const refreshUserInfo = () => {
    fetchUserInfo();
};

// 关闭窗口
const closeWindow = () => {
    emit('close');
};

// 最小化窗口
const minimizeWindow = () => {
    emit('minimize');
};

// 组件加载完成后获取用户信息
onMounted(() => {
    fetchUserInfo();
});
</script>

<style scoped>
/* 窗口内容样式 */
.window-content {
    padding: 20px;
    overflow-y: auto;
    height: 100%;
}

/* 加载状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.mac-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(0, 122, 255, 0.2);
    border-radius: 50%;
    border-top-color: #007aff;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 个人信息样式 */
.profile-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.profile-header {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #007aff;
    margin-right: 20px;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.user-info h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
}

.member-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
}

.member-badge.free {
    background-color: #f1f1f1;
    color: #666;
    width: 100px;
}

.member-badge.basic {
    background-color: #e3f2fd;
    color: #1976d2;
}

.member-badge.premium {
    background-color: #fff8e1;
    color: #f57c00;
}

.member-badge.vip {
    background-color: #fce4ec;
    color: #c2185b;
}

/* 信息区域样式 */
.info-section, .credits-section, .daily-check-section {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
}

.info-section h3, .credits-section h3, .daily-check-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}

.sign-in-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    background-color: #ff9500;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.sign-in-btn:hover {
    background-color: #e67e00;
}

.sign-in-icon {
    font-size: 16px;
}

.sign-in-tip {
    font-size: 12px;
    color: #666;
    margin-top: 10px;
}

.info-row {
    display: flex;
    margin-bottom: 10px;
}

.info-row .label {
    width: 80px;
    color: #666;
}

.info-row .value {
    flex: 1;
    color: #333;
}

/* 积分卡片样式 */
.credits-container {
    display: flex;
    gap: 15px;
}

.credit-card {
    flex: 1;
    background: white;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.credit-icon {
    font-size: 24px;
    margin-bottom: 10px;
}

.credit-amount {
    font-size: 22px;
    font-weight: bold;
    color: #007aff;
    margin-bottom: 5px;
}

.credit-label {
    font-size: 12px;
    color: #666;
}

/* 按钮样式 */
.actions-section {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.mac-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    background-color: #f1f1f1;
    color: #333;
    transition: all 0.2s;
}

.mac-btn:hover {
    background-color: #e5e5e5;
}

.mac-btn.primary {
    background-color: #007aff;
    color: white;
}

.mac-btn.primary:hover {
    background-color: #0066cc;
}

/* 错误信息 */
.error-message {
    color: #ff3b30;
    font-size: 14px;
    text-align: center;
    margin-top: 10px;
}
</style> 