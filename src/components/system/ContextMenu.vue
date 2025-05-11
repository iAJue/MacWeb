<template>
    <div 
        class="context-menu" 
        v-show="visible" 
        :style="{ top: position.y + 'px', left: position.x + 'px' }"
        @click.stop
    >
        <div class="menu-group">
            <div class="menu-item" @click="handleViewAction">
                <span>查看</span>
            </div>
            <div class="menu-item" @click="handleSortAction">
                <span>排序方式</span>
            </div>
            <div class="menu-item" @click="handleRefreshAction">
                <span>刷新</span>
            </div>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-group">
            <div class="menu-item" @click="handleCreateFileAction">
                <span>新建文件</span>
            </div>
            <div class="menu-item" @click="handleCreateFolderAction">
                <span>新建文件夹</span>
            </div>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-group">
            <div class="menu-item" @click="handleChangeWallpaper">
                <span>切换壁纸</span>
            </div>
            <div class="menu-item" @click="handleDisplaySettings">
                <span>显示设置</span>
            </div>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-group">
            <div class="menu-item" @click="handlePersonalizeAction">
                <span>个性化</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { nextTick } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    position: {
        type: Object,
        default: () => ({ x: 0, y: 0 })
    }
});

const emit = defineEmits(['close']);

const handleViewAction = () => {
    emit('close');
};

const handleSortAction = () => {
    emit('close');
};

const handleRefreshAction = () => {
    window.location.reload();
    emit('close');
};

const handleCreateFileAction = () => {
    emit('close');
};

const handleCreateFolderAction = () => {
    emit('close');
};

// 随机切换壁纸
const handleChangeWallpaper = () => {
    const currentWallpaper = parseInt(localStorage.getItem('wallpaper') || '1');
    let newWallpaper;
    do {
        newWallpaper = Math.floor(Math.random() * 20) + 1;
    } while (newWallpaper === currentWallpaper);
    
    localStorage.setItem('wallpaper', newWallpaper.toString());
    
    const preloadImage = new Image();
    
    preloadImage.src = `/assets/wallpaper/${newWallpaper}.jpg`;
    
    preloadImage.onload = () => {
        nextTick(() => {
            const desktop = document.querySelector('.mac-desktop');
            if (desktop) {
                desktop.style.transition = 'background-image 1s ease-in-out';
                desktop.style.filter = 'blur(5px)';
                setTimeout(() => {
                    desktop.style.backgroundImage = `url('/assets/wallpaper/${newWallpaper}.jpg')`;
                    setTimeout(() => {
                        desktop.style.filter = 'none';
                    }, 300);
                    console.log(`壁纸已切换为: ${newWallpaper}.jpg`);
                }, 100);
            }
        });
    };
    
    preloadImage.onerror = () => {
        alert('壁纸加载失败，请检查图片路径是否正确');
    };
    
    emit('close');
};

const handleDisplaySettings = () => {
    emit('close');
};

const handlePersonalizeAction = () => {
    emit('close');
};

// 处理点击外部关闭菜单
const handleOutsideClick = (event) => {
    if (props.visible) {
        emit('close');
    }
};

// 阻止默认的浏览器右键菜单
const preventDefaultContextMenu = (event) => {
    if (props.visible) {
        event.preventDefault();
    }
};

// 组件挂载和卸载时绑定/解绑全局事件监听器
onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('contextmenu', preventDefaultContextMenu);
});

onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('contextmenu', preventDefaultContextMenu);
});
</script>

<style scoped>
.context-menu {
    position: fixed;
    background-color: rgba(240, 240, 240, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    min-width: 200px;
    z-index: 1000;
    user-select: none;
    animation: fade-in 0.15s ease-out;
    transform-origin: top left;
}

.menu-group {
    padding: 5px 0;
}

.menu-item {
    padding: 8px 15px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    transition: all 0.1s;
}

.menu-item:hover {
    background-color: rgba(0, 122, 255, 0.15);
}

.menu-divider {
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 2px 0;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style> 