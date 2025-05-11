<template>
    <div class="notification-center">
        <div class="notification-header">
            <h3>通知中心</h3>
            <button @click="closeNotificationCenter">关闭</button>
        </div>
        <div class="notification-content">
            <div class="notification-item">
                <img src="/assets/icons/Messages.png" alt="消息" width="40" height="40">
                <div class="notification-text">
                    <strong>消息</strong>
                    <p>没有新消息</p>
                </div>
            </div>
            <div class="notification-item">
                <img src="/assets/icons/Mail.png" alt="邮件" width="40" height="40">
                <div class="notification-text">
                    <strong>邮件</strong>
                    <p>没有未读邮件</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// 事件发射
const emit = defineEmits(['close']);

// 关闭通知中心
const closeNotificationCenter = () => {
    emit('close');
};
</script>

<style scoped>
/* 通知中心 */
.notification-center {
    position: fixed;
    top: 25px;
    right: 0;
    bottom: 0;
    width: 300px;
    background-color: rgba(240, 240, 240, 0.9);
    backdrop-filter: blur(10px);
    z-index: 1900; 
    box-shadow: -2px 0 15px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
}

.notification-header {
    padding: 20px 15px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.notification-header button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
}

.notification-header button:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.notification-content {
    padding: 15px;
}

.notification-item {
    display: flex;
    margin-bottom: 15px;
    padding: 10px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notification-item img {
    margin-right: 10px;
}

.notification-text {
    flex: 1;
}

.notification-text strong {
    display: block;
    margin-bottom: 5px;
    color: #333;
}

.notification-text p {
    margin: 0;
    color: #666;
    font-size: 13px;
}
</style> 