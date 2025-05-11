<template>
    <MacWindow 
        title="关于" 
        :isMinimized="isMinimized" 
        @close="closeApp" 
        @minimize="toggleMinimize"
        width="300"
    >
        <div class="about-content">
            <div class="app-logo">
                <img src="/assets/icons/WebAI.png" alt="WebAI" width="80">
            </div>
            <h2>WebAI</h2>
            <p>版本 1.0.0</p>
            <p>一个基于AI的Web开发工具</p>
            <p>集成了多种UI框架和JS框架支持</p>
        </div>
        <div class="copyright-info">
            <p>© 2025 <a href="https://moejue.cn/" target="_blank">MoeJue</a></p>
        </div>
    </MacWindow>
</template>

<script setup>
import MacWindow from '@/components/common/MacWindow.vue';

// 定义属性
const props = defineProps({
    isMinimized: {
        type: Boolean,
        default: false
    }
});

// 事件发射
const emit = defineEmits(['close', 'minimize']);

// 关闭应用
const closeApp = () => {
    emit('close');
};

// 切换最小化状态
const toggleMinimize = () => {
    emit('minimize');
};
</script>

<style scoped>
/* 关于窗口 */
.about-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 20px;
}

.app-logo {
    margin-bottom: 15px;
}

.app-logo img {
    width: 80px;
    height: 80px;
    object-fit: contain;
}

.about-content h2 {
    margin: 10px 0;
    font-size: 18px;
    color: #333;
}

.about-content p {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
    text-align: center;
}

.copyright-info {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    color: #999;
    text-align: right;
}

.copyright-info a {
    color: #337ab7;
    text-decoration: none;
}

.copyright-info a:hover {
    color: #23527c;
}
</style> 