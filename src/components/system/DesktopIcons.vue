<template>
    <div class="desktop-icons">
        <div class="desktop-icon" @click="openApp('notes')">
            <div class="icon-container">
                <img src="/assets/icons/Notes.png" alt="使用帮助">
            </div>
            <div class="icon-text">使用帮助</div>
        </div>
        <div class="desktop-icon" @click="openApp('about')">
            <div class="icon-container">
                <img src="/assets/icons/Settings.png" alt="关于">
            </div>
            <div class="icon-text">关于</div>
        </div>
        <!-- <div class="desktop-icon" @click="openApp('editor')">
            <div class="icon-container">
                <img src="/assets/icons/vscode.png" alt="VsCode">
            </div>
            <div class="icon-text">VsCode</div>
        </div>
        <div class="desktop-icon" @click="openApp('safari')">
            <div class="icon-container">
                <img src="/assets/icons/Safari.png" alt="Safari">
            </div>
            <div class="icon-text">Safari</div>
        </div>
        <div class="desktop-icon" @click="openApp('music')">
            <div class="icon-container">
                <img src="/assets/icons/MoeKoeMusic.png" alt="MoeKoeMusic">
            </div>
            <div class="icon-text">MoeKoeMusic</div>
        </div> -->
    </div>
</template>

<script setup>
// 事件发射
const emit = defineEmits(['openApp']);

// 打开App
const openApp = (app) => {
    emit('openApp', app);
};
</script>

<style scoped>
/* 桌面图标 */
.desktop-icons {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding-top: 35px; /* 为顶部菜单栏留出空间 */
    margin-left: 20px;
}

.desktop-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    width: 80px;
}

.desktop-icon:hover {
    transform: scale(1.05);
}

.icon-container {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
}

.icon-container img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.icon-text {
    color: white;
    font-size: 12px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    text-align: center;
}
</style> 