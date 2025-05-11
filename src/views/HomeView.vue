<template>
    <!-- 使用登录组件 -->
    <LoginScreen 
        v-if="isLoading" 
        :isResourcesLoaded="resourcesLoaded"
        @login-complete="handleLoginComplete"
    />

    <!-- 主桌面界面 -->
    <div class="mac-desktop" @click="closeAllMenus" @contextmenu.prevent="handleContextMenu">
        <!-- Mac顶部导航栏 -->
        <MenuBar />

        <!-- Mac桌面背景和图标 -->
        <DesktopIcons @openApp="openApp" />

        <!-- 底部Dock栏 -->
        <Dock @openApp="openApp" />

        <!-- 右键菜单 -->
        <ContextMenu 
            :visible="showContextMenu" 
            :position="contextMenuPosition"
            @close="showContextMenu = false"
        />

        <!-- 生成器窗口 -->
        <Teleport to="body">
            <Generator 
                v-if="showGenerator" 
                :isMinimized="isGeneratorMinimized"
                @close="showGenerator = false"
                @minimize="isGeneratorMinimized = !isGeneratorMinimized"
                @updateGeneratedCode="updateGeneratedCode"
                @updateSessionInfo="updateSessionInfo"
                @openApp="openApp"
            />
        </Teleport>

        <!-- 编辑器窗口 -->
        <Teleport to="body">
            <CodeEditor 
                v-if="showEditor" 
                :isMinimized="isEditorMinimized"
                :code="generatedCode"
                :filename="filename"
                @close="showEditor = false"
                @minimize="isEditorMinimized = !isEditorMinimized"
                @codeUpdated="handleCodeUpdated"
                @openApp="openApp"
            />
        </Teleport>

        <!-- Mac风格浏览器预览窗口 -->
        <Teleport to="body">
            <Preview 
                v-if="showPreview" 
                :isMinimized="isPreviewMinimized"
                :code="generatedCode"
                @close="showPreview = false"
                @minimize="isPreviewMinimized = !isPreviewMinimized"
            />
        </Teleport>

        <!-- 版本管理器窗口 -->
        <Teleport to="body">
            <Finder
                v-if="showFinder"
                :isMinimized="isFinderMinimized"
                :currentprojectId="currentprojectId"
                @close="showFinder = false"
                @minimize="isFinderMinimized = !isFinderMinimized"
                @loadVersion="handleLoadVersion"
                @continueVersion="handleContinueVersion"
            />
        </Teleport>

        <!-- 继续对话窗口 -->
        <Teleport to="body">
            <ContinueDialog
                v-if="showContinueDialog"
                :isMinimized="isContinueDialogMinimized"
                :projectId="currentprojectId"
                :versionId="currentVersionId"
                :originalPrompt="originalPrompt"
                :currentCode="generatedCode"
                @close="showContinueDialog = false"
                @minimize="isContinueDialogMinimized = !isContinueDialogMinimized"
                @codeGenerated="handleContinueCodeGenerated"
            />
        </Teleport>

        <!-- 关于窗口 -->
        <Teleport to="body">
            <About 
                v-if="showAbout" 
                :isMinimized="isAboutMinimized"
                @close="showAbout = false"
                @minimize="isAboutMinimized = !isAboutMinimized"
            />
        </Teleport>

        <!-- Notes应用窗口 -->
        <Teleport to="body">
            <Notes 
                v-if="showNotes" 
                :isMinimized="isNotesMinimized"
                @close="showNotes = false"
                @minimize="isNotesMinimized = !isNotesMinimized"
            />
        </Teleport>

        <!-- 个人中心窗口 -->
        <Teleport to="body">
            <Profile 
                v-if="showProfile" 
                :isMinimized="isProfileMinimized"
                @close="showProfile = false"
                @minimize="isProfileMinimized = !isProfileMinimized"
            />
        </Teleport>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 导入系统组件
import LoginScreen from '@/components/system/LoginScreen.vue';
import MenuBar from '@/components/system/MenuBar.vue';
import Dock from '@/components/system/Dock.vue';
import DesktopIcons from '@/components/system/DesktopIcons.vue';
import ContextMenu from '@/components/system/ContextMenu.vue';

// 导入应用组件
import Generator from '@/components/apps/Generator.vue';
import CodeEditor from '@/components/apps/CodeEditor.vue';
import Preview from '@/components/apps/Safari.vue';
import About from '@/components/apps/About.vue';
import Finder from '@/components/apps/Finder.vue';
import ContinueDialog from '@/components/apps/ContinueDialog.vue';
import Notes from '@/components/apps/Notes.vue';
import Profile from '@/components/apps/Profile.vue';

// 加载状态
const isLoading = ref(true);
const resourcesLoaded = ref(false);

// 窗口状态
const showGenerator = ref(false);
const showEditor = ref(false);
const showPreview = ref(false);
const showAbout = ref(false);
const showFinder = ref(false);
const showContinueDialog = ref(false);
const showNotes = ref(false);
const showProfile = ref(false);
const isGeneratorMinimized = ref(false);
const isEditorMinimized = ref(false);
const isPreviewMinimized = ref(false);
const isAboutMinimized = ref(false);
const isFinderMinimized = ref(false);
const isContinueDialogMinimized = ref(false);
const isNotesMinimized = ref(false);
const isProfileMinimized = ref(false);

// 右键菜单状态
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

// 桌面壁纸
const currentWallpaper = ref(1);

// 生成的代码和相关数据
const generatedCode = ref('');
const originalPrompt = ref('');
const currentprojectId = ref('');
const currentVersionId = ref('');
const filename = ref('');

// 显示右键菜单
const handleContextMenu = (event) => {
    // 阻止默认的浏览器右键菜单
    event.preventDefault();
    
    // 设置菜单位置
    contextMenuPosition.value = {
        x: event.clientX,
        y: event.clientY
    };
    
    // 显示自定义菜单
    showContextMenu.value = true;
};

// 点击桌面时关闭所有菜单
const closeAllMenus = () => {
    showContextMenu.value = false;
};

// 打开应用
const openApp = (appName) => {
    // 检查是否是带有URL的对象格式
    if (typeof appName === 'object' && appName.type === 'safari') {
        if (appName.target === '_blank') {
            window.open(appName.url, '_blank');
        } else {
            showPreview.value = true;
            isPreviewMinimized.value = false;
            localStorage.setItem('safariUrl', appName.url || '');
        }
    } else {
        switch (appName) {
            case 'generator':
                showGenerator.value = true;
                isGeneratorMinimized.value = false;
                break;
            case 'editor':
                showEditor.value = true;
                isEditorMinimized.value = false;
                break;
            case 'safari':
                showPreview.value = true;
                isPreviewMinimized.value = false;
                localStorage.removeItem('safariUrl');
                break;
            case 'about':
                showAbout.value = true;
                isAboutMinimized.value = false;
                break;
            case 'Finder':
                showFinder.value = true;
                isFinderMinimized.value = false;
                break;
            case 'continue-dialog':
                showContinueDialog.value = true;
                isContinueDialogMinimized.value = false;
                break;
            case 'notes':
                showNotes.value = true;
                isNotesMinimized.value = false;
                break;
            case 'profile':
                showProfile.value = true;
                isProfileMinimized.value = false;
                break;
        }
    }
};

// 更新生成的代码
const updateGeneratedCode = (code) => {
    generatedCode.value = code;
    filename.value = 'index.html';
    // 确保编辑器窗口已打开
    if (!showEditor.value) {
        showEditor.value = true;
        isEditorMinimized.value = false;
    }
};

// 更新会话信息
const updateSessionInfo = (prompt, projectId, versionId, shouldOpenContinueDialog = false) => {
    originalPrompt.value = prompt || '';
    currentprojectId.value = projectId || '';
    currentVersionId.value = versionId || '';
    
    // 打开相关窗口的逻辑
    if (!showPreview.value && generatedCode.value && !generatedCode.value.startsWith('// 代码正在生成中')) {
        // 延迟打开预览窗口
        setTimeout(() => {
            openApp('safari');
        }, 800);
    }
    
    // 根据请求决定是否打开继续对话组件
    if (shouldOpenContinueDialog && projectId && !showContinueDialog.value) {
        setTimeout(() => {
            showContinueDialog.value = true;
            isContinueDialogMinimized.value = false;
        }, 1000);
    }
};

// 处理代码更新事件
const handleCodeUpdated = (code) => {
    generatedCode.value = code;
};

// 处理版本加载事件
const handleLoadVersion = (versionDetail) => {
    if (versionDetail && versionDetail.code) {
        generatedCode.value = versionDetail.code;
        originalPrompt.value = versionDetail.prompt || '';
        
        // 打开编辑器和预览
        showEditor.value = true;
        isEditorMinimized.value = false;
        
        setTimeout(() => {
            showPreview.value = true;
            isPreviewMinimized.value = false;
        }, 500);
    }
};

// 处理继续对话版本
const handleContinueVersion = (version) => {
    if (version) {
        // 先加载这个版本
        handleLoadVersion(version);
        
        // 打开继续对话窗口
        setTimeout(() => {
            showContinueDialog.value = true;
            isContinueDialogMinimized.value = false;
        }, 800);
    }
};

// 处理继续生成的代码
const handleContinueCodeGenerated = async (code, additionalPrompt) => {
    // 更新代码
    generatedCode.value = code;
    
    // 确保编辑器和预览窗口打开并更新
    showEditor.value = true;
    isEditorMinimized.value = false;
    
    setTimeout(() => {
        showPreview.value = true;
        isPreviewMinimized.value = false;
    }, 500);
    
    // 如果版本管理器打开，刷新它
    if (showFinder.value) {
        // 通过重新打开来刷新
        showFinder.value = false;
        setTimeout(() => {
            showFinder.value = true;
        }, 100);
    }
};

// 处理登录完成事件
const handleLoginComplete = () => {
    isLoading.value = false;
};

// 检查资源加载
const checkResourcesLoaded = () => {
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve(true);
        } else {
            window.addEventListener('load', () => {
                resolve(true);
            });
        }
    });
};

// 页面加载完成后执行
onMounted(async () => {
    // 检查资源加载状态
    checkResourcesLoaded().then(() => {
        resourcesLoaded.value = true;
    });
    
    // 从本地存储加载保存的壁纸
    const savedWallpaper = localStorage.getItem('wallpaper') || 1;
    currentWallpaper.value = parseInt(savedWallpaper);
    const desktop = document.querySelector('.mac-desktop');
    if (desktop) {
        const preloadImage = new Image();
        preloadImage.src = `/assets/wallpaper/${currentWallpaper.value}.jpg`;
        preloadImage.onload = () => {
            desktop.style.backgroundImage = `url('/assets/wallpaper/${currentWallpaper.value}.jpg')`;
            desktop.style.transition = 'background-image 1s ease-in-out';
        };
    }
});
</script>

<style scoped>
/* Mac桌面和全局样式 */
.mac-desktop {
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
    position: relative;
    user-select: none;
    display: flex;
    flex-direction: column;
    cursor: default;
    box-sizing: border-box;
    transition: background-image 1s ease-in-out, filter 0.3s ease;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>