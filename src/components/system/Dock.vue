<template>
    <div class="mac-dock">
        <div class="dock-item" @click="openApp('Finder')">
            <img src="/assets/icons/Finder.png" alt="Finder" title="Finder">
        </div>
        <div class="dock-item" @click="openApp('generator')">
            <img src="/assets/icons/Reminders.png" alt="代码生成器" title="代码生成器">
        </div>
        <div class="dock-item" @click="openApp('editor')">
            <img src="/assets/icons/vscode.png" alt="VsCode" title="VsCode">
        </div>
        <div class="dock-item" @click="openApp('safari')">
            <img src="/assets/icons/Safari.png" alt="Safari" title="Safari">
        </div>
        <div class="dock-item" @click="openApp('about')">
            <img src="/assets/icons/Settings.png" alt="关于" title="关于">
        </div>
        <div class="dock-item" @click="openApp('profile')">
            <img src="/assets/icons/Contacts.png" alt="个人中心" title="个人中心">
        </div>
        <div class="dock-item" @click="openSystemMail">
            <img src="/assets/icons/Mail.png" alt="邮件" title="邮件">
        </div>
        <div class="dock-item" @click="openWeb('https://photo.moejue.cn/')">
            <img src="/assets/icons/Photos.png" alt="照片" title="照片">
        </div>
        <div class="dock-item" @click="openWeb('https://moejue.cn/')">
            <img src="/assets/icons/Maps.png" alt="Blog" title="Blog">
        </div>
        <!-- <div class="dock-item">
            <img src="/assets/icons/youtube.png" alt="youtube" title="youtube">
        </div> -->
        <div class="dock-item" @click="openWeb('https://github.com/iAJue/MacWeb', '_blank')">
            <img src="/assets/icons/Github.png" alt="Github" title="Github">
        </div>
        <div class="dock-item" @click="openWeb('http://music.moekoe.cn/')">
            <img src="/assets/icons/MoeKoeMusic.png" alt="MoeKoeMusic" title="MoeKoeMusic">
        </div>
    </div>
</template>

<script setup>
// 事件发射
const emit = defineEmits(['openApp']);

// 打开App
const openApp = (app) => {
    emit('openApp', app);
};

// 打开网页
const openWeb = (url, target = '_self') => {
    emit('openApp', { type: 'safari', url: url, target: target });
};

// 打开系统邮件
const openSystemMail = () => {
    const email = 'moejue@qq.com';
    const subject = encodeURIComponent('WebAI反馈Bug');
    const body = encodeURIComponent('我在使用WebAI时发现了以下问题：\n\n[请在此描述您遇到的问题]\n\n系统信息：\n浏览器：' + navigator.userAgent);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
};
</script>

<style scoped>
/* Mac Dock栏 */
.mac-dock {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 15px;
    padding: 10px 20px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.dock-item {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
}

.dock-item img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.dock-item:hover {
    transform: translateY(-8px) scale(1.1);
}
</style> 