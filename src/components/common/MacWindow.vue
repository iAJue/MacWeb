<template>
    <div class="mac-window" 
         :class="{ 
            'minimized': isMinimized, 
            'closing': isClosing, 
            'opening': isOpening,
            'maximized': isMaximized 
         }" 
         :style="windowStyle"
         @click.self="bringToFront"
         ref="windowRef"
         tabindex="0"
         @keydown.esc="closeWindow">
        <div class="window-titlebar" @mousedown="startDrag" @dblclick="toggleMaximize">
            <div class="window-buttons">
                <div class="window-button close" @click="closeWindow"></div>
                <div class="window-button minimize" @click="toggleMinimize"></div>
                <div class="window-button maximize" @click="toggleMaximize"></div>
            </div>
            <div class="window-title">{{ title }}</div>
        </div>
        <div class="window-content" :style="contentStyle">
            <slot></slot>
        </div>
        <!-- 调整大小的手柄 -->
        <div class="resize-handle resize-handle-se" @mousedown="startResize($event, 'se')"></div>
        <div class="resize-handle resize-handle-sw" @mousedown="startResize($event, 'sw')"></div>
        <div class="resize-handle resize-handle-ne" @mousedown="startResize($event, 'ne')"></div>
        <div class="resize-handle resize-handle-nw" @mousedown="startResize($event, 'nw')"></div>
        <div class="resize-handle resize-handle-n" @mousedown="startResize($event, 'n')"></div>
        <div class="resize-handle resize-handle-s" @mousedown="startResize($event, 's')"></div>
        <div class="resize-handle resize-handle-e" @mousedown="startResize($event, 'e')"></div>
        <div class="resize-handle resize-handle-w" @mousedown="startResize($event, 'w')"></div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

// 属性定义
const props = defineProps({
    title: {
        type: String,
        default: 'Window'
    },
    isMinimized: {
        type: Boolean,
        default: false
    },
    width: {
        type: [String, Number],
        default: '600px'
    },
    height: {
        type: [String, Number],
        default: 'auto'
    },
    startMaximized: {
        type: Boolean,
        default: false
    },
    zIndex: {
        type: Number,
        default: 1000
    }
});

// 窗口引用
const windowRef = ref(null);

// 窗口层级
const currentZIndex = ref(props.zIndex);

// 状态变量
const isClosing = ref(false);
const isOpening = ref(true);
const isMaximized = ref(false);
const isMaximizing = ref(false); // 添加最大化动画状态
const isRestoring = ref(false); // 添加恢复动画状态

// 窗口位置和大小
const windowPosition = ref({ x: 0, y: 0 });
const windowSize = ref({
    width: typeof props.width === 'number' ? props.width : parseInt(props.width) || 600,
    height: typeof props.height === 'number' ? props.height : parseInt(props.height) || 400
});

// 拖动状态
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

// 调整大小状态
const isResizing = ref(false);
const resizeDirection = ref('');
const resizeStartPos = ref({ x: 0, y: 0 });
const resizeStartSize = ref({ width: 0, height: 0 });
const resizeStartPosition = ref({ x: 0, y: 0 });

// 存储最大化前的窗口状态
const preMaximizeState = ref({
    position: { x: 0, y: 0 },
    size: { width: 0, height: 0 }
});

// 获取菜单栏高度
const menuBarHeight = ref(0);
onMounted(() => {
    // 查找菜单栏元素并获取其高度
    const menuBarElement = document.querySelector('.menu-bar');
    if (menuBarElement) {
        menuBarHeight.value = menuBarElement.offsetHeight;
    } else {
        // 默认菜单栏高度
        menuBarHeight.value = 25; // macOS默认菜单栏高度
    }
});

// 事件发射
const emit = defineEmits(['close', 'minimize', 'maximize', 'focus']);

// 将窗口置于顶层
const bringToFront = () => {
    // 获取所有窗口并查找当前最高的z-index
    const allWindows = document.querySelectorAll('.mac-window');
    let maxZIndex = 1000; // 基础z-index
    
    allWindows.forEach(window => {
        const computedStyle = getComputedStyle(window);
        const zIndex = parseInt(computedStyle.zIndex || 1000);
        if (zIndex > maxZIndex) {
            maxZIndex = zIndex;
        }
    });
    
    // 设置当前窗口的z-index比最高值大1
    currentZIndex.value = maxZIndex + 1;
    
    // 聚焦窗口以便可以接收键盘事件
    if (windowRef.value) {
        windowRef.value.focus();
    }
    
    // 通知父组件窗口已聚焦
    emit('focus');
};

// 关闭窗口时添加动画
const closeWindow = () => {
    isClosing.value = true;
    setTimeout(() => {
        emit('close');
    }, 300); // 动画持续时间
};

// 切换最小化状态
const toggleMinimize = () => {
    emit('minimize');
};

// 切换最大化状态
const toggleMaximize = () => {
    if (isMaximized.value) {
        // 开始恢复动画
        isRestoring.value = true;
        
        setTimeout(() => {
            // 恢复到之前的大小和位置
            windowPosition.value = { ...preMaximizeState.value.position };
            windowSize.value = { ...preMaximizeState.value.size };
            isMaximized.value = false;
            
            // 延迟结束恢复动画
            setTimeout(() => {
                isRestoring.value = false;
            }, 300);
            
            emit('maximize', false);
        }, 50);
    } else {
        // 保存当前状态并开始最大化动画
        preMaximizeState.value = {
            position: { ...windowPosition.value },
            size: { ...windowSize.value }
        };
        
        isMaximizing.value = true;
        
        setTimeout(() => {
            windowPosition.value = { x: 0, y: menuBarHeight.value };
            windowSize.value = { 
                width: window.innerWidth,
                height: window.innerHeight - menuBarHeight.value
            };
            isMaximized.value = true;
            
            // 延迟结束最大化动画
            setTimeout(() => {
                isMaximizing.value = false;
            }, 300);
            
            emit('maximize', true);
        }, 50);
    }
};

// 开始拖动
const startDrag = (event) => {
    // 如果是最大化状态，不允许拖动
    if (isMaximized.value) return;
    
    // 如果点击的是按钮，不进行拖动
    if (event.target.classList.contains('window-button')) return;
    
    // 确保窗口在最前
    bringToFront();
    
    isDragging.value = true;
    const rect = windowRef.value.getBoundingClientRect();
    dragOffset.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
};

// 执行拖动
const doDrag = (event) => {
    if (!isDragging.value) return;
    
    const x = event.clientX - dragOffset.value.x;
    const y = event.clientY - dragOffset.value.y;
    
    // 限制不能拖出顶部
    const limitedY = Math.max(menuBarHeight.value, y);
    
    windowPosition.value = { x, y: limitedY };
};

// 停止拖动
const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', stopDrag);
};

// 开始调整大小
const startResize = (event, direction) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 如果是最大化状态，不允许调整大小
    if (isMaximized.value) return;
    
    // 确保窗口在最前
    bringToFront();
    
    isResizing.value = true;
    resizeDirection.value = direction;
    resizeStartPos.value = { x: event.clientX, y: event.clientY };
    resizeStartSize.value = { ...windowSize.value };
    resizeStartPosition.value = { ...windowPosition.value };
    
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
};

// 执行调整大小
const doResize = (event) => {
    if (!isResizing.value) return;
    
    const dx = event.clientX - resizeStartPos.value.x;
    const dy = event.clientY - resizeStartPos.value.y;
    const dir = resizeDirection.value;
    
    const newSize = { ...windowSize.value };
    const newPosition = { ...windowPosition.value };
    
    // 根据不同方向调整大小和位置
    if (dir.includes('e')) {
        newSize.width = Math.max(300, resizeStartSize.value.width + dx);
    }
    if (dir.includes('w')) {
        const newWidth = Math.max(300, resizeStartSize.value.width - dx);
        newPosition.x = resizeStartPosition.value.x + (resizeStartSize.value.width - newWidth);
        newSize.width = newWidth;
    }
    if (dir.includes('s')) {
        newSize.height = Math.max(200, resizeStartSize.value.height + dy);
    }
    if (dir.includes('n')) {
        const newHeight = Math.max(200, resizeStartSize.value.height - dy);
        // 确保不超过菜单栏
        const potentialY = resizeStartPosition.value.y + (resizeStartSize.value.height - newHeight);
        newPosition.y = Math.max(menuBarHeight.value, potentialY);
        
        // 根据实际可用的Y位置重新计算高度
        if (potentialY < menuBarHeight.value) {
            const heightAdjustment = menuBarHeight.value - potentialY;
            newSize.height = newHeight - heightAdjustment;
        } else {
            newSize.height = newHeight;
        }
    }
    
    windowSize.value = newSize;
    windowPosition.value = newPosition;
};

// 停止调整大小
const stopResize = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
};

// 在组件挂载时触发开启动画
onMounted(() => {
    if (props.startMaximized) {
        setTimeout(() => {
            toggleMaximize();
        }, 0);
    }
    
    isOpening.value = true;
    setTimeout(() => {
        isOpening.value = false;
    }, 500);
    
    // 初始化窗口位置为居中
    const windowWidth = typeof props.width === 'number' ? props.width : parseInt(props.width) || 600;
    const windowHeight = typeof props.height === 'number' ? props.height : parseInt(props.height) || 400;
    
    windowPosition.value = {
        x: (window.innerWidth - windowWidth) / 2,
        y: Math.max(menuBarHeight.value, (window.innerHeight - windowHeight) / 2)
    };
    
    // 添加窗口调整大小事件监听
    window.addEventListener('resize', handleWindowResize);
    
    // 初始时聚焦窗口，使其可以接收键盘事件
    setTimeout(() => {
        if (windowRef.value) {
            windowRef.value.focus();
            
            // 确保新创建的窗口在最顶层
            bringToFront();
        }
    }, 100);
    
    // 立即将窗口置于最顶层（不等待DOM更新）
    bringToFront();
});

// 处理窗口大小调整
const handleWindowResize = () => {
    if (isMaximized.value) {
        windowPosition.value = { x: 0, y: menuBarHeight.value };
        windowSize.value = {
            width: window.innerWidth,
            height: window.innerHeight - menuBarHeight.value
        };
    }
};

// 窗口样式计算
const windowStyle = computed(() => {
    const style = isMaximized.value ? {
        top: `${menuBarHeight.value}px`,
        left: '0',
        width: '100vw',
        height: `calc(100vh - ${menuBarHeight.value}px)`,
        transform: 'none',
        borderRadius: '0',
        transition: isMaximizing.value || isRestoring.value ? 'all 0.3s ease-in-out' : 'opacity 0.3s, transform 0.3s'
    } : {
        top: `${windowPosition.value.y}px`,
        left: `${windowPosition.value.x}px`,
        width: `${windowSize.value.width}px`,
        height: `${windowSize.value.height}px`,
        transform: 'none',
        transition: isMaximizing.value || isRestoring.value ? 'all 0.3s ease-in-out' : 'opacity 0.3s, transform 0.3s'
    };
    
    style.zIndex = currentZIndex.value;
    
    return style;
});

// 内容区样式
const contentStyle = computed(() => {
    const style = {};
    if (isMaximized.value) {
        style.height = `calc(100vh - ${menuBarHeight.value + 36}px)`;
    } else if (windowSize.value.height) {
        style.height = `${windowSize.value.height - 36}px`;
    }
    return style;
});
</script>

<style scoped>
/* Mac风格窗口 */
.mac-window {
    position: fixed;
    background-color: rgba(250, 250, 250, 0.95);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    backdrop-filter: blur(10px);
    z-index: 1000;
    outline: none; /* 移除焦点时的轮廓 */
}

/* 打开动画 */
.opening {
    animation: window-open 0.5s ease-out;
}

/* 关闭动画 */
.closing {
    transform: scale(0.5) !important;
    opacity: 0;
}

/* 最大化状态 */
.maximized {
    border-radius: 0;
}

@keyframes window-open {
    from {
        transform: scale(0.5);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes window-maximize {
    from {
        border-radius: 10px;
    }
    to {
        border-radius: 0;
    }
}

@keyframes window-restore {
    from {
        border-radius: 0;
    }
    to {
        border-radius: 10px;
    }
}

.window-titlebar {
    display: flex;
    align-items: center;
    background-color: #f1f1f1;
    height: 36px;
    border-bottom: 1px solid #e0e0e0;
    padding: 0 12px;
    position: relative;
    cursor: move;
    user-select: none;
}

.window-buttons {
    display: flex;
    gap: 8px;
    z-index: 10;
}

.window-button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s;
}

.window-button:hover {
    transform: scale(1.1);
}

.window-button.close {
    background-color: #ff5f57;
}

.window-button.minimize {
    background-color: #febc2e;
}

.window-button.maximize {
    background-color: #28c941;
}

.window-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 13px;
    color: #4a4a4a;
    font-weight: 500;
    pointer-events: none;
}

.window-content {
    /* overflow: auto; */
}

/* 最小化状态 */
.minimized {
    transform: translate(0, 100vh) !important;
    opacity: 0;
}

/* 调整大小的手柄 */
.resize-handle {
    position: absolute;
    background-color: transparent;
}

.resize-handle-n {
    top: 0;
    left: 10px;
    right: 10px;
    height: 5px;
    cursor: ns-resize;
}

.resize-handle-s {
    bottom: 0;
    left: 10px;
    right: 10px;
    height: 5px;
    cursor: ns-resize;
}

.resize-handle-e {
    top: 10px;
    right: 0;
    bottom: 10px;
    width: 5px;
    cursor: ew-resize;
}

.resize-handle-w {
    top: 10px;
    left: 0;
    bottom: 10px;
    width: 5px;
    cursor: ew-resize;
}

.resize-handle-ne {
    top: 0;
    right: 0;
    width: 10px;
    height: 10px;
    cursor: nesw-resize;
}

.resize-handle-nw {
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    cursor: nwse-resize;
}

.resize-handle-se {
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    cursor: nwse-resize;
}

.resize-handle-sw {
    bottom: 0;
    left: 0;
    width: 10px;
    height: 10px;
    cursor: nesw-resize;
}

.maximized .resize-handle {
    display: none;
}
</style> 