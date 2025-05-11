<template>
    <div class="mac-menubar" @click.stop>
        <div class="menubar-left">
            <div class="mac-logo" @click="toggleAppleMenu">
                <img src="/assets/icons/mac.png" alt="Mac Logo">
                <!-- Apple菜单 -->
                <div class="apple-menu" v-if="showAppleMenu">
                    <div class="menu-item">关于本机</div>
                    <div class="menu-divider"></div>
                    <div class="menu-item">系统偏好设置...</div>
                    <div class="menu-item">App Store...</div>
                    <div class="menu-divider"></div>
                    <div class="menu-item">最近使用的项目</div>
                    <div class="menu-divider"></div>
                    <div class="menu-item">强制退出...</div>
                    <div class="menu-divider"></div>
                    <div class="menu-item">睡眠</div>
                    <div class="menu-item">重新启动...</div>
                    <div class="menu-item">关机...</div>
                    <div class="menu-divider"></div>
                    <div class="menu-item">退出登录...</div>
                </div>
            </div>
            <div class="menubar-items">
                <span class="menubar-item active">Web AI</span>
                <span class="menubar-item" @click="toggleFileMenu">
                    文件
                    <!-- 文件菜单 -->
                    <div class="dropdown-menu" v-if="showFileMenu">
                        <div class="menu-item">新建</div>
                        <div class="menu-item">打开</div>
                        <div class="menu-item">保存</div>
                        <div class="menu-divider"></div>
                        <div class="menu-item">导出</div>
                    </div>
                </span>
                <span class="menubar-item">编辑</span>
                <span class="menubar-item">视图</span>
                <span class="menubar-item">窗口</span>
                <span class="menubar-item">帮助</span>
            </div>
        </div>
        <div class="menubar-right">
            <div class="menubar-icons">
                <span class="menubar-icon" @click="toggleNotificationCenter">
                    <el-icon><Bell /></el-icon>
                </span>
                <span class="menubar-icon">
                    <el-icon><CopyDocument /></el-icon>
                </span>
                <span class="menubar-icon" @click="toggleSignInModal"> 
                    <el-icon><Coin /></el-icon>
                </span>
                <span class="menubar-battery">
                    <div class="battery-icon">
                        <div class="battery-level"></div>
                    </div>
                    <span>100%</span>
                </span>
                <span class="menubar-date-time" @click="toggleCalendar">
                    <span class="menubar-time">{{ currentTime }}</span>
                </span>
            </div>
        </div>
    </div>
    <!-- 签到弹窗 -->
    <SignInModal v-model:visible="showSignInModal"/>
    
    <!-- 通知中心 -->
    <NotificationCenter v-if="showNotificationCenter" @close="showNotificationCenter = false" />
    
    <!-- 日历视图 -->
    <Calendar v-if="showCalendar" @close="showCalendar = false" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { CopyDocument, Bell, Coin } from '@element-plus/icons-vue';
import SignInModal from './SignInModal.vue';
import NotificationCenter from './NotificationCenter.vue';
import Calendar from './Calendar.vue';

// 菜单状态
const showAppleMenu = ref(false);
const showFileMenu = ref(false);
const showSignInModal = ref(false);
const showNotificationCenter = ref(false);
const showCalendar = ref(false);

// 事件发射
const emit = defineEmits(['toggleNotificationCenter', 'toggleCalendar', 'updateCredits']);

// 切换Apple菜单
const toggleAppleMenu = () => {
    showAppleMenu.value = !showAppleMenu.value;
    showFileMenu.value = false;
};

// 切换文件菜单
const toggleFileMenu = () => {
    showFileMenu.value = !showFileMenu.value;
    showAppleMenu.value = false;
};

// 切换通知中心
const toggleNotificationCenter = () => {
    showNotificationCenter.value = !showNotificationCenter.value;
    showCalendar.value = false;
    showAppleMenu.value = false;
    showFileMenu.value = false;
};

// 切换日历
const toggleCalendar = () => {
    showCalendar.value = !showCalendar.value;
    showNotificationCenter.value = false;
    showAppleMenu.value = false;
    showFileMenu.value = false;
};

// 切换签到弹窗
const toggleSignInModal = () => {
    showSignInModal.value = true;
    showAppleMenu.value = false;
    showFileMenu.value = false;
};

// 当前时间
const currentTime = ref('');
let timeInterval = null;

// 更新时间的函数
const updateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    currentTime.value = `${hours}:${minutes}`;
};

// 组件挂载后初始化
onMounted(() => {
    // 初始化时间并设置定时器
    updateTime();
    timeInterval = setInterval(updateTime, 60000);
});

// 组件卸载前清理
onBeforeUnmount(() => {
    // 清除定时器
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
});
</script>

<style scoped>
/* Mac顶部菜单栏 */
.mac-menubar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 25px;
    background-color: rgba(50, 50, 50, 0.7);
    backdrop-filter: blur(10px);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    font-size: 13px;
    z-index: 2000;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
}

.menubar-left {
    display: flex;
    align-items: center;
}

.mac-logo {
    width: 18px;
    height: 18px;
    margin-right: 15px;
    position: relative;
    cursor: pointer;
}

.mac-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.menubar-items {
    display: flex;
    gap: 18px;
}

.menubar-item {
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s;
    position: relative;
}

.menubar-item:hover, .menubar-item.active {
    opacity: 1;
}

.menubar-right {
    display: flex;
    align-items: center;
}

.menubar-icons {
    display: flex;
    align-items: center;
    gap: 12px;
}

.menubar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s;
    height: 16px;
}

.menubar-icon:hover {
    opacity: 1;
}

.menubar-icon .el-icon {
    font-size: 14px;
}

.menubar-date-time {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 15px;
}

.menubar-date {
    opacity: 0.7;
    font-size: 10px;
}

.menubar-time {
    font-weight: 600;
}

.menubar-battery {
    display: flex;
    align-items: center;
    font-size: 12px;
    gap: 4px;
}

.battery-icon {
    width: 20px;
    height: 10px;
    border: 1px solid white;
    border-radius: 2px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 1px;
}

.battery-icon:after {
    content: '';
    position: absolute;
    right: -3px;
    top: 2px;
    height: 6px;
    width: 2px;
    background: white;
    border-radius: 0 1px 1px 0;
}

.battery-level {
    background-color: white;
    height: 100%;
    width: 100%;
    border-radius: 1px;
}

/* 下拉菜单样式 */
.apple-menu {
    position: absolute;
    top: 25px;
    left: 0;
    background-color: rgba(50, 50, 50, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 5px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    min-width: 200px;
    z-index: 2100; /* 确保高于顶部菜单栏 */
    padding: 5px 0;
}

.dropdown-menu {
    position: absolute;
    top: 25px;
    left: 0;
    background-color: rgba(50, 50, 50, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 5px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    min-width: 180px;
    z-index: 2100; /* 确保高于顶部菜单栏 */
    padding: 5px 0;
}

.menu-item {
    padding: 5px 15px;
    cursor: pointer;
    font-size: 13px;
    color: #fff;
}

.menu-item:hover {
    background-color: #0078d7;
}

.menu-divider {
    height: 1px;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 5px 0;
}
</style> 