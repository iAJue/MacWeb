<template>
    <MacWindow 
        title="VS Code" 
        :isMinimized="isMinimized" 
        @close="closeWindow" 
        @minimize="minimizeWindow"
        width="1100"
        height="700"
        :startMaximized="true"
    >
        <div class="vscode-container">
            <!-- 活动栏 (最左侧图标栏) -->
            <div class="activity-bar">
                <div class="activity-bar-item" :class="{ active: activeActivityBarItem === 'explorer' }" 
                     title="资源管理器" @click="setActiveActivityBarItem('explorer')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path><path d="M3 12h18"></path><path d="M3 18h18"></path>
                    </svg>
                </div>
                <div class="activity-bar-item" :class="{ active: activeActivityBarItem === 'search' }" 
                     title="搜索" @click="setActiveActivityBarItem('search')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <div class="activity-bar-item" :class="{ active: activeActivityBarItem === 'git' }" 
                     title="Git" @click="setActiveActivityBarItem('git')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle>
                        <path d="M6 21V9a9 9 0 0 0 9 9"></path>
                    </svg>
                </div>
                <div class="activity-bar-item" :class="{ active: activeActivityBarItem === 'debug' }" 
                     title="调试" @click="setActiveActivityBarItem('debug')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="M12 18v-2"></path><path d="M12 8V6"></path>
                    </svg>
                </div>
                <div class="activity-bar-item" :class="{ active: activeActivityBarItem === 'extensions' }" 
                     title="扩展" @click="setActiveActivityBarItem('extensions')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect>
                    </svg>
                </div>
            </div>
            
            <!-- 侧边栏 (根据活动栏选择显示不同内容) -->
            <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
                <div class="sidebar-header">
                    <div class="sidebar-title">{{ sidebarContent === 'explorer' ? '资源管理器' : 
                                                  sidebarContent === 'search' ? '搜索' : 
                                                  sidebarContent === 'git' ? 'GIT' : 
                                                  sidebarContent === 'debug' ? '调试' : '扩展' }}</div>
                    <div class="sidebar-actions">
                        <button class="sidebar-action" title="更多操作">...</button>
                        <button class="sidebar-action sidebar-collapse-btn" title="折叠侧边栏" @click="toggleSidebar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <!-- 资源管理器 -->
                <div v-if="sidebarContent === 'explorer'" class="sidebar-content">
                    <div class="sidebar-section">
                        <div class="sidebar-section-header">
                            <span class="sidebar-section-title">打开的编辑器</span>
                            <button class="sidebar-section-action">...</button>
                        </div>
                        <div v-for="(tab, index) in editorTabs" :key="'tab-' + index" 
                             class="sidebar-item" :class="{ active: index === activeEditorTab }"
                             @click="setActiveTab(index)">
                            <span class="file-icon">{{ tab.icon }}</span>
                            <span class="file-name">{{ tab.name }}</span>
                            <span v-if="tab.modified">•</span>
                        </div>
                        <div v-if="editorTabs.length === 0" class="sidebar-message">
                            没有打开的编辑器
                        </div>
                    </div>
                    
                    <div class="sidebar-section">
                        <div class="sidebar-section-header">
                            <span class="sidebar-section-title">项目文件</span>
                            <button class="sidebar-section-action">...</button>
                        </div>
                        <div class="sidebar-message" v-if="folderStructure.length === 0">
                            没有打开的文件夹
                        </div>
                        <div class="file-tree" v-else>
                            <template v-for="(item, itemIndex) in folderStructure" :key="'item-' + itemIndex">
                                <div v-if="item.type === 'folder'" class="file-tree-item folder" 
                                     :class="{ expanded: item.expanded }" @click="toggleFolder(item)">
                                    <span class="folder-icon">{{ item.expanded ? '📂' : '📁' }}</span>
                                    <span class="folder-name">{{ item.name }}</span>
                                </div>
                                <div v-if="item.type === 'file'" class="file-tree-item file" 
                                     @click="openFile(item)">
                                    <span class="file-icon">{{ item.icon }}</span>
                                    <span class="file-name">{{ item.name }}</span>
                                </div>
                                
                                <!-- 子文件/文件夹，如果父文件夹已展开 -->
                                <template v-if="item.type === 'folder' && item.expanded && item.children">
                                    <div v-for="(child, childIndex) in item.children" :key="'child-' + itemIndex + '-' + childIndex" 
                                         class="file-tree-item" :class="{ folder: child.type === 'folder', file: child.type === 'file' }"
                                         style="padding-left: 24px;" 
                                         @click="child.type === 'folder' ? toggleFolder(child) : openFile(child)">
                                        <span class="file-icon">{{ child.type === 'folder' ? (child.expanded ? '📂' : '📁') : child.icon }}</span>
                                        <span :class="child.type === 'folder' ? 'folder-name' : 'file-name'">{{ child.name }}</span>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </div>
                </div>
                
                <!-- 搜索面板 -->
                <div v-if="sidebarContent === 'search'" class="sidebar-content">
                    <div class="search-box">
                        <input type="text" placeholder="搜索" class="search-input" v-model="searchQuery" @keyup.enter="search">
                        <div class="search-box-buttons">
                            <button class="search-box-button" title="区分大小写">Aa</button>
                            <button class="search-box-button" title="使用正则表达式">.*</button>
                            <button class="search-box-button" title="整词匹配">Ab</button>
                        </div>
                    </div>
                    
                    <div v-if="searchResults.length === 0" class="sidebar-message">
                        在工作区中搜索（输入搜索词后按回车键）
                    </div>
                    
                    <div v-else class="search-results">
                        <div v-for="(result, index) in searchResults" :key="'result-' + index" class="search-result-item">
                            <div class="search-result-path">{{ result.path }}:{{ result.line }}</div>
                            <div class="search-result-text">{{ result.text }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Git面板 -->
                <div v-if="sidebarContent === 'git'" class="sidebar-content">
                    <div class="sidebar-section">
                        <div class="sidebar-section-header">
                            <span class="sidebar-section-title">更改</span>
                        </div>
                        <div class="sidebar-message">
                            没有检测到 Git 仓库
                            <button class="text-button">初始化 Git 仓库</button>
                        </div>
                    </div>
                </div>
                
                <!-- 调试面板 -->
                <div v-if="sidebarContent === 'debug'" class="sidebar-content">
                    <div class="sidebar-section">
                        <div class="sidebar-message">
                            还没有运行和调试配置。
                            <button class="text-button">运行或调试</button>
                        </div>
                    </div>
                </div>
                
                <!-- 扩展面板 -->
                <div v-if="sidebarContent === 'extensions'" class="sidebar-content">
                    <div class="search-box">
                        <input type="text" placeholder="搜索扩展" class="search-input">
                    </div>
                    <div class="sidebar-section">
                        <div class="sidebar-section-header">
                            <span class="sidebar-section-title">已安装</span>
                        </div>
                        <div class="sidebar-message">
                            没有已安装的扩展
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 主编辑区域 -->
            <div class="editor-wrapper">
                <div class="editor-area">
                    <!-- 编辑器标签栏 -->
                    <div class="editor-tabs">
                        <div v-for="(tab, index) in editorTabs" :key="'editortab-' + index" 
                            class="editor-tab" :class="{ active: index === activeEditorTab }"
                            @click="setActiveTab(index)">
                            <span class="file-icon">{{ tab.icon }}</span>
                            <span class="tab-filename">{{ tab.name }}</span>
                            <span v-if="tab.modified" class="tab-modified">•</span>
                            <button class="tab-close" @click.stop="closeTab(index, $event)">×</button>
                        </div>
                    </div>
                    
                    <!-- 编辑器主体 -->
                    <div class="editor-main">
                        <div class="editor-container" ref="editorContainer">
                            <div v-if="editorTabs.length === 0" class="welcome-content">
                                <div class="welcome-title">欢迎使用 Web AI</div>
                                <div class="welcome-subtitle">代码编辑，重新定义。</div>
                                <div class="welcome-actions">
                                    <div class="welcome-action">
                                        <div class="welcome-action-title">开始</div>
                                        <div class="welcome-action-item">新建文件...</div>
                                        <div class="welcome-action-item">打开文件夹...</div>
                                    </div>
                                    <div class="welcome-action">
                                        <div class="welcome-action-title">最近</div>
                                        <div class="welcome-action-item">无最近打开的文件夹</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 面板区域 (终端、问题、输出等) -->
                    <div class="panel-area" v-if="showPanel" :style="{ height: panelHeight + 'px' }">
                        <div class="panel-resize-handle" @mousedown="resizePanel"></div>
                        <div class="panel-header">
                            <div class="panel-tabs">
                                <div class="panel-tab" :class="{ active: activePanelTab === 'terminal' }" 
                                    @click="setPanelTab('terminal')">终端</div>
                                <div class="panel-tab" :class="{ active: activePanelTab === 'problems' }" 
                                    @click="setPanelTab('problems')">问题 <span v-if="problemsCount > 0">({{ problemsCount }})</span></div>
                                <div class="panel-tab" :class="{ active: activePanelTab === 'output' }" 
                                    @click="setPanelTab('output')">输出</div>
                                <div class="panel-tab" :class="{ active: activePanelTab === 'debugConsole' }" 
                                    @click="setPanelTab('debugConsole')">调试控制台</div>
                            </div>
                            <div class="panel-actions">
                                <button class="panel-action" title="最大化面板">□</button>
                                <button class="panel-action" title="关闭面板" @click="togglePanel">×</button>
                            </div>
                        </div>
                        
                        <!-- 面板内容 -->
                        <div class="panel-content">
                            <!-- 终端 -->
                            <div v-if="activePanelTab === 'terminal'" class="terminal">
                                <div class="terminal-line">
                                    <span class="terminal-prompt">$</span>
                                    <span class="terminal-cursor"></span>
                                </div>
                            </div>
                            
                            <!-- 问题面板 -->
                            <div v-if="activePanelTab === 'problems'" class="problems-panel">
                                <div v-if="problemsCount === 0" class="panel-message">
                                    目前没有发现问题。
                                </div>
                                <div v-else class="panel-message">
                                    发现 {{ problemsCount }} 个问题。
                                </div>
                            </div>
                            
                            <!-- 输出面板 -->
                            <div v-if="activePanelTab === 'output'" class="output-panel">
                                <div class="panel-message">
                                    没有活动的任务输出。
                                </div>
                            </div>
                            
                            <!-- 调试控制台 -->
                            <div v-if="activePanelTab === 'debugConsole'" class="debug-console">
                                <div class="panel-message">
                                    调试会话尚未开始。
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 状态栏 -->
            <div class="status-bar">
                <div class="status-bar-left">
                    <div class="status-item">
                        <span class="status-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle>
                                <path d="M6 21V9a9 9 0 0 0 9 9"></path>
                            </svg>
                        </span>
                        <span>{{ currentBranch }}</span>
                    </div>
                    <div class="status-item">
                        <span class="status-icon">⚠️</span>
                        <span>{{ problemsCount }}</span>
                        <span class="status-icon">❌</span>
                        <span>0</span>
                    </div>
                    <div class="status-item">
                        <button class="copy-btn" @click="copyCode" title="复制代码">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            复制
                        </button>
                    </div>
                    <div class="status-item">
                        <button class="copy-btn" @click="openPreview" title="打开预览">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
                            </svg>
                            预览
                        </button>
                    </div>
                    <div class="status-item">
                        <button class="copy-btn" @click="openContinueDialog" title="继续编辑">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 12h3v8h8v-3h3L12 2z"></path>
                            </svg>
                            继续编辑
                        </button>
                    </div>
                </div>
                <div class="status-bar-right">
                    <div class="status-item">{{ language }}</div>
                    <div class="status-item">{{ encoding }}</div>
                    <div class="status-item">LF</div>
                    <div class="status-item">{{ lineColumn }}</div>
                    <div class="status-item">{{ indentation }}</div>
                    <div class="status-item" title="光标位置">
                        <span>行 {{ cursorPosition.line }}, 列 {{ cursorPosition.column }}</span>
                    </div>
                </div>
            </div>
        </div>
    </MacWindow>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount, computed } from 'vue';
import { ElMessage } from 'element-plus';
import loader from '@monaco-editor/loader';
import MacWindow from '@/components/common/MacWindow.vue';

// 定义属性
const props = defineProps({
    isMinimized: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
        default: ''
    },
    filename: {
        type: String,
        default: ''
    }
});

// 事件发射
const emit = defineEmits(['close', 'minimize', 'codeUpdated', 'openApp']);

// 状态变量
const editorContainer = ref(null);
const detectedLanguage = ref('javascript'); // 默认语言
const lastUpdateTime = ref(Date.now()); // 上次更新时间
const updateFrequency = ref(1000); // 更新频率（毫秒），初始值较大
const isGenerating = ref(false); // 是否正在生成代码
let monacoEditor = null; // 编辑器实例
let preserveEditorState = false; // 是否保留编辑器状态
const sidebarCollapsed = ref(false); // 侧边栏是否折叠

// 数据定义
const isMinimized = ref(false);
const activeActivityBarItem = ref('explorer');
const activeEditorTab = ref(0);
const editorTabs = ref([]);
const folderStructure = ref([]);

// 面板相关
const showPanel = ref(true);
const panelHeight = ref(200);
const activePanelTab = ref('terminal');
const problemsCount = ref(0);

// 状态栏信息
const language = computed(() => {
    return detectedLanguage.value || '普通文本';
});
const currentBranch = ref('main');
const encoding = ref('UTF-8');
const lineColumn = ref('第 1 行，第 1 列');
const indentation = ref('空格：2');
const cursorPosition = ref({line: 1, column: 1});

// 计算属性
const sidebarContent = computed(() => activeActivityBarItem.value);

// 搜索相关
const searchQuery = ref('');
const searchResults = ref([]);

// 方法
function setActiveActivityBarItem(item) {
    activeActivityBarItem.value = item;
}

// 折叠/展开侧边栏
function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    // 侧边栏宽度变化后，重新计算编辑器布局
    nextTick(() => {
        if (monacoEditor) {
            monacoEditor.layout();
        }
    });
}

function toggleFolder(folder) {
    folder.expanded = !folder.expanded;
}

function openFile(file) {
    // 如果有openFile的实现，保留它
}

function getLanguageFromFileName(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const languageMap = {
        'js': 'javascript',
        'html': 'html',
        'css': 'css',
        'vue': 'html',
        'json': 'json',
        'md': 'markdown',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'php': 'php',
        'rb': 'ruby',
        'rs': 'rust',
        'sql': 'sql'
    };
    return languageMap[extension] || '普通文本';
}

function setActiveTab(index) {
    activeEditorTab.value = index;
}

function closeTab(index, event) {
    if (event) event.stopPropagation();
    if (editorTabs.value.length > 1) {
        editorTabs.value.splice(index, 1);
        activeEditorTab.value = Math.min(activeEditorTab.value, editorTabs.value.length - 1);
    } else {
        editorTabs.value = [];
        activeEditorTab.value = -1;
    }
}

// 面板相关方法
function togglePanel() {
    showPanel.value = !showPanel.value;
    // 面板高度变化后，重新计算编辑器布局
    nextTick(() => {
        if (monacoEditor) {
            monacoEditor.layout();
        }
    });
}

function setPanelTab(tab) {
    activePanelTab.value = tab;
}

function resizePanel(event) {
    // 记录初始位置
    const startY = event.clientY;
    const startHeight = panelHeight.value;
    
    function onMouseMove(e) {
        // 计算新高度
        const delta = startY - e.clientY;
        
        // 获取编辑器区域的总高度，用于计算最大面板高度
        const editorAreaHeight = document.querySelector('.editor-area')?.clientHeight || 500;
        // 限制最大高度为编辑区域的40%
        const maxPanelHeight = Math.min(500, editorAreaHeight * 0.4);
        
        panelHeight.value = Math.max(100, Math.min(maxPanelHeight, startHeight + delta));
        
        // 实时调整编辑器布局
        if (monacoEditor) {
            monacoEditor.layout();
        }
    }
    
    function onMouseUp() {
        // 移除事件监听器
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    // 添加事件监听器
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// 搜索相关方法
function search() {
    // 如果需要实现搜索功能，可以在这里添加
    if (!searchQuery.value.trim()) {
        searchResults.value = [];
        return;
    }
}

// 窗口操作方法
function closeWindow() {
    emit('close');
}

function minimizeWindow() {
    isMinimized.value = true;
    emit('minimize');
}


// 复制代码
const copyCode = () => {
    if (monacoEditor) {
        const code = monacoEditor.getValue();
        navigator.clipboard.writeText(code)
            .then(() => {
                ElMessage.success('代码已复制到剪贴板');
            })
            .catch(() => {
                ElMessage.error('复制失败');
            });
    }
};
// 打开预览
const openPreview = () => {
    emit('openApp', 'safari');
};
// 继续编辑
const openContinueDialog = () => {
    emit('openApp', 'continue-dialog');
};
// 检测代码语言类型
const detectLanguage = (code) => {
    // 根据代码内容简单判断语言类型
    if (code.includes('<template>') && code.includes('<script>')) {
        return 'html'; // Monaco不直接支持Vue，使用HTML
    } else if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
        return 'html';
    } else if (code.includes('import React') || code.includes('from "react"')) {
        return 'javascript'; // Monaco使用javascript作为JSX
    } else if (code.includes('@media') || code.includes('@keyframes')) {
        return 'css';
    } else if (code.includes('<style>') || code.includes('</style>')) {
        return 'html';
    }
    return getLanguageFromFileName(props.filename);
};

// 更新光标位置状态
const updateCursorPosition = () => {
    if (monacoEditor) {
        const position = monacoEditor.getPosition();
        if (position) {
            cursorPosition.value = {
                line: position.lineNumber,
                column: position.column
            };
            lineColumn.value = `第 ${position.lineNumber} 行，第 ${position.column} 列`;
        }
    }
};

// 初始化Monaco编辑器
const initMonacoEditor = async () => {
    if (editorContainer.value && !monacoEditor) {
        try {
            const monaco = await loader.init();
            
            // 创建编辑器实例
            monacoEditor = monaco.editor.create(editorContainer.value, {
                value: props.code,
                language: detectLanguage(props.code),
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: {
                    enabled: true
                },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                tabSize: 2,
                readOnly: false, // 允许编辑
                scrollbar: {
                    // 优化滚动条设置
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    alwaysConsumeMouseWheel: false,
                    scrollByPage: false
                },
                wordWrap: 'on', // 启用自动换行
                renderLineHighlight: 'all', // 高亮当前行
                glyphMargin: false,
                smoothScrolling: true, // 平滑滚动
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true
            });
            
            // 更新检测到的语言
            detectedLanguage.value = detectLanguage(props.code);

            // 添加代码更改监听
            monacoEditor.onDidChangeModelContent(() => {
                if (!preserveEditorState) {
                    const updatedCode = monacoEditor.getValue();
                    emit('codeUpdated', updatedCode);
                }
            });

            // 添加光标位置变化监听
            monacoEditor.onDidChangeCursorPosition(updateCursorPosition);

            // 初始设置光标位置
            updateCursorPosition();

            // 如果代码正在生成中，初始滚动到底部
            nextTick(() => {
                if (props.code && props.code.includes('// 代码正在生成中') || isGenerating.value) {
                    // 获取总行数
                    const lineCount = monacoEditor.getModel().getLineCount();
                    // 滚动到底部
                    monacoEditor.revealLine(lineCount);
                    // 定位光标到底部
                    const lastLine = lineCount;
                    const lastColumn = monacoEditor.getModel().getLineMaxColumn(lastLine);
                    monacoEditor.setPosition({ lineNumber: lastLine, column: lastColumn });
                    updateCursorPosition();
                }
            });

        } catch (error) {
            console.error('初始化Monaco编辑器失败:', error);
        }
    } else if (monacoEditor) {
        // 如果编辑器已经存在，只更新内容
        preserveEditorState = true; // 防止触发不必要的更新
        
        const currentPosition = monacoEditor.getPosition();
        const currentSelections = monacoEditor.getSelections();
        const currentScrollTop = monacoEditor.getScrollTop();
        
        monacoEditor.getModel().setValue(props.code);
        const language = detectLanguage(props.code);
        detectedLanguage.value = language;
        monacoEditor.updateOptions({ language });
        
        // 恢复光标位置和滚动状态
        if (currentPosition) {
            monacoEditor.setPosition(currentPosition);
            if (currentSelections) {
                monacoEditor.setSelections(currentSelections);
            }
            monacoEditor.setScrollTop(currentScrollTop);
        }
        
        preserveEditorState = false; // 恢复更新
        
        // 如果代码正在生成中，滚动到底部
        if (props.code && props.code.includes('// 代码正在生成中') || isGenerating.value) {
            nextTick(() => {
                const lastLine = monacoEditor.getModel().getLineCount();
                monacoEditor.revealLine(lastLine);
                updateCursorPosition();
            });
        }
    }
};

// 处理窗口大小变化
const handleResize = () => {
    if (monacoEditor) {
        monacoEditor.layout();
    }
    
    // 重新检查面板高度，确保不超过限制
    if (showPanel.value) {
        const editorAreaHeight = document.querySelector('.editor-area')?.clientHeight || 500;
        const maxPanelHeight = Math.min(500, editorAreaHeight * 0.4);
        if (panelHeight.value > maxPanelHeight) {
            panelHeight.value = maxPanelHeight;
        }
    }
};

// 组件挂载后初始化
onMounted(() => {
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
    
    // 初始化编辑器标签
    if (props.filename) {
        editorTabs.value = [{
            name: props.filename,
            icon: '📄',
            language: getLanguageFromFileName(props.filename),
            modified: false
        }];
    }
    
    // 初始化编辑器
    nextTick(() => {
        if (!props.isMinimized) {
            initMonacoEditor();
        }
    });
});

// 组件卸载前清理
onBeforeUnmount(() => {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', handleResize);
    
    // 销毁编辑器
    if (monacoEditor) {
        monacoEditor.dispose();
    }
});

// 监听代码属性变化
watch(
    () => props.code,
    (newCode, oldCode) => {
        if (monacoEditor) {
            // 计算更新频率
            const now = Date.now();
            const elapsed = now - lastUpdateTime.value;
            lastUpdateTime.value = now;
            
            // 如果间隔小于2秒，认为是在生成过程中
            if (elapsed < 2000 && newCode !== oldCode && newCode.length > oldCode?.length) {
                isGenerating.value = true;
                // 动态调整更新频率 (指数移动平均)
                updateFrequency.value = 0.7 * updateFrequency.value + 0.3 * elapsed;
            } else if (elapsed > 3000) {
                // 如果间隔较长，可能不是连续生成
                isGenerating.value = false;
            }
            
            // 保存当前编辑器状态
            preserveEditorState = true;
            const currentPosition = monacoEditor.getPosition();
            const selections = monacoEditor.getSelections();
            const scrollTop = monacoEditor.getScrollTop();
            
            // 更新编辑器内容
            monacoEditor.getModel().setValue(newCode);
            const language = detectLanguage(newCode);
            detectedLanguage.value = language;
            monacoEditor.updateOptions({ language });
            
            // 如果是在生成过程中（代码变长），则滚动到最新内容
            const newLines = newCode.split('\n').length;
            const oldLines = oldCode ? oldCode.split('\n').length : 0;
            
            if (newCode.length > oldCode?.length && newLines > oldLines) {
                // 滚动到最后一行
                nextTick(() => {
                    // 判断是否是增量更新（生成中）还是完全替换
                    if ((newCode.startsWith(oldCode || '') || isGenerating.value) && newCode !== oldCode) {
                        // 生成中，滚动到底部
                        const lastLineNumber = monacoEditor.getModel().getLineCount();
                        monacoEditor.revealLine(lastLineNumber, 1); // 1表示顶部对齐
                        
                        // 如果代码包含"生成中"的提示，则等待提示消失后再滚动
                        if (newCode.includes('// 代码正在生成中')) {
                            preserveEditorState = false;
                            return;
                        }
                        
                        // 光标定位到末尾，提升用户体验
                        const lastLineLength = monacoEditor.getModel().getLineContent(lastLineNumber).length;
                        monacoEditor.setPosition({ lineNumber: lastLineNumber, column: lastLineLength + 1 });
                        updateCursorPosition();
                    } else if (currentPosition) {
                        // 完全替换，尝试保持当前位置
                        monacoEditor.setPosition(currentPosition);
                        if (selections) {
                            monacoEditor.setSelections(selections);
                        }
                        monacoEditor.revealPosition(currentPosition);
                        monacoEditor.setScrollTop(scrollTop);
                        updateCursorPosition();
                    }
                    preserveEditorState = false;
                });
            } else {
                // 如果不是增量更新，恢复之前的位置
                if (currentPosition) {
                    monacoEditor.setPosition(currentPosition);
                    if (selections) {
                        monacoEditor.setSelections(selections);
                    }
                    monacoEditor.setScrollTop(scrollTop);
                }
                preserveEditorState = false;
            }
        }
    }
);

// 监听文件名变化并更新标签
watch(
    () => props.filename,
    (newFilename) => {
        if (newFilename) {
            // 更新编辑器标签
            editorTabs.value = [{
                name: newFilename,
                icon: '📄',
                language: getLanguageFromFileName(newFilename),
                modified: false
            }];
            
            // 更新编辑器语言
            if (monacoEditor) {
                const language = getLanguageFromFileName(newFilename);
                detectedLanguage.value = language;
                monacoEditor.updateOptions({ language });
            }
        }
    }
);

// 监听最小化状态变化以正确初始化编辑器
watch(
    () => props.isMinimized,
    (isMinimized) => {
        if (!isMinimized) {
            nextTick(() => {
                initMonacoEditor();
            });
        }
    }
);

// 监听侧边栏折叠状态，重新布局编辑器
watch(
    () => sidebarCollapsed.value,
    () => {
        nextTick(() => {
            if (monacoEditor) {
                monacoEditor.layout();
            }
        });
    }
);
</script>

<style scoped>
.vscode-container {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas: 
        "activity-bar sidebar editor"
        "status-bar status-bar status-bar";
    height: 100%;
    color: #CCCCCC;
    background-color: #1E1E1E;
    overflow: hidden;
}

.activity-bar {
    grid-area: activity-bar;
    width: 48px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;
    flex-shrink: 0;
    z-index: 10;
}

.activity-bar-item {
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #858585;
    position: relative;
    cursor: pointer;
}

.activity-bar-item:hover {
    color: #ffffff;
}

.activity-bar-item.active {
    color: #ffffff;
}

.activity-bar-item.active::before {
    content: "";
    position: absolute;
    left: 0;
    height: 100%;
    width: 2px;
    background-color: #007acc;
}

.sidebar {
    grid-area: sidebar;
    width: 200px;
    height: 100%;
    background-color: #252526;
    border-right: 1px solid #3c3c3c;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.2s ease;
    z-index: 5;
}

.sidebar-collapsed {
    width: 0;
    overflow: hidden;
    border-right: none;
}

.sidebar-header {
    height: 35px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 11px;
    color: #cccccc;
}

.sidebar-title {
    flex-grow: 1;
}

.sidebar-actions {
    display: flex;
}

.sidebar-action {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    color: #cccccc;
    font-size: 16px;
    cursor: pointer;
}

.sidebar-collapse-btn {
    transform: rotate(0deg);
    transition: transform 0.2s ease;
}

.sidebar-collapsed .sidebar-collapse-btn {
    transform: rotate(180deg);
}

.sidebar-action:hover {
    color: #ffffff;
}

.sidebar-content {
    flex-grow: 1;
    overflow-y: auto;
}

.sidebar-section {
    margin-bottom: 10px;
}

.sidebar-section-header {
    height: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    color: #bbbbbb;
}

.sidebar-section-title {
    flex-grow: 1;
}

.sidebar-section-action {
    background: none;
    border: none;
    color: #bbbbbb;
    cursor: pointer;
    font-size: 14px;
}

.sidebar-item, .file-tree-item {
    height: 22px;
    display: flex;
    align-items: center;
    padding: 0 8px;
    cursor: pointer;
}

.sidebar-item:hover, .file-tree-item:hover {
    background-color: #2a2d2e;
}

.sidebar-item.active {
    background-color: #37373d;
}

.file-icon, .folder-icon {
    margin-right: 5px;
}

.search-box {
    padding: 8px;
}

.search-input {
    height: 24px;
    background-color: #3c3c3c;
    border: 1px solid #3c3c3c;
    color: #cccccc;
    padding: 0 6px;
    outline: none;
}

.search-input:focus {
    border-color: #007acc;
}

.search-box-buttons {
    display: flex;
    margin-top: 4px;
}

.search-box-button {
    background: none;
    border: none;
    color: #cccccc;
    margin-right: 4px;
    cursor: pointer;
    font-size: 12px;
    border: 1px solid #3c3c3c;
}

.sidebar-message {
    padding: 10px;
    color: #999999;
    text-align: center;
    font-style: italic;
    font-size: 13px;
}

.editor-wrapper {
    grid-area: editor;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
}

.editor-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    min-height: 0;
}

.editor-tabs {
    height: 35px;
    background-color: #252526;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #3c3c3c;
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
    -ms-overflow-style: none; 
}

.editor-tab {
    height: 35px;
    min-width: 120px;
    max-width: 200px;
    display: flex;
    align-items: center;
    padding: 0 8px;
    background-color: #2d2d2d;
    border-right: 1px solid #3c3c3c;
    font-size: 13px;
    color: #cccccc;
    cursor: pointer;
    flex-shrink: 0;
}

.editor-tab.active {
    background-color: #1e1e1e;
    color: #ffffff;
    border-top: 1px solid #007acc;
}

.tab-filename {
    flex-grow: 1;
    margin-left: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tab-close {
    background: none;
    border: none;
    color: #cccccc;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.7;
}

.tab-close:hover {
    opacity: 1;
}

.editor-main {
    flex: 1;
    overflow: hidden;
    position: relative;
    min-height: 0;
}

.editor-container {
    width: 100%;
    height: 100%;
}

.welcome-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    color: #cccccc;
}

.welcome-title {
    font-size: 32px;
    font-weight: 300;
    margin-bottom: 10px;
    color: #ffffff;
}

.welcome-subtitle {
    font-size: 18px;
    margin-bottom: 40px;
    color: #cccccc;
}

.welcome-actions {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
    justify-content: center;
}

.welcome-action {
    text-align: left;
    min-width: 200px;
}

.welcome-action-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #ffffff;
}

.welcome-action-item {
    margin: 8px 0;
    color: #007acc;
    cursor: pointer;
}

.welcome-action-item:hover {
    text-decoration: underline;
}

.panel-area {
    height: 200px;
    max-height: 40%;
    border-top: 1px solid #3c3c3c;
    display: flex;
    flex-direction: column;
    position: relative;
    flex-shrink: 0;
    min-height: 0;
    overflow: hidden;
}

.panel-resize-handle {
    position: absolute;
    top: -5px;
    left: 0;
    right: 0;
    height: 10px;
    cursor: ns-resize;
    z-index: 10;
}

.panel-header {
    height: 35px;
    background-color: #252526;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    flex-shrink: 0;
}

.panel-tabs {
    display: flex;
    height: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none; 
}

.panel-tab {
    padding: 0 10px;
    display: flex;
    align-items: center;
    height: 100%;
    color: #cccccc;
    cursor: pointer;
    white-space: nowrap;
}

.panel-tab.active {
    color: #ffffff;
    border-top: 1px solid #007acc;
    background-color: #1e1e1e;
}

.panel-actions {
    display: flex;
}

.panel-action {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    color: #cccccc;
    font-size: 16px;
    cursor: pointer;
}

.panel-action:hover {
    color: #ffffff;
}

.panel-content {
    flex: 1;
    overflow: auto;
    background-color: #1e1e1e;
    min-height: 0;
}

.panel-message {
    padding: 20px;
    color: #999999;
    text-align: center;
    font-style: italic;
}

.terminal {
    padding: 10px;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
}

.terminal-prompt {
    color: #22da6e;
    margin-right: 8px;
    font-size: 15px;
}

.terminal-command {
    color: #ffffff;
}

.terminal-output {
    color: #cccccc;
}

.terminal-cursor {
    display: inline-block;
    width: 8px;
    height: 1em;
    background-color: #cccccc;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
}

.status-bar {
    grid-area: status-bar;
    display: flex;
    justify-content: space-between;
    background-color: #007acc;
    color: white;
    height: 22px;
    font-size: 12px;
    width: 100%;
    overflow: hidden;
    z-index: 10;
}

.status-bar-left, .status-bar-right {
    display: flex;
    align-items: center;
    overflow: hidden;
}

.status-bar-left {
    flex: 1;
    justify-content: flex-start;
    min-width: 0;
}

.status-bar-right {
    flex: 1;
    justify-content: flex-end;
    min-width: 0;
}

.status-item {
    padding: 0 8px;
    display: flex;
    align-items: center;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    height: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-item:last-child {
    border-right: none;
}

.status-icon {
    margin-right: 4px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.copy-btn {
    background: none;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
}

.copy-btn:hover {
    opacity: 0.8;
}

.file-tree {
    margin-top: 5px;
}

.file-tree-item {
    white-space: nowrap;
}

.folder-name, .file-name {
    margin-left: 5px;
}

.text-button {
    background: none;
    border: none;
    background-color: #007acc;
    color: #ffffff;
    cursor: pointer;
    margin-top: 20px;
    padding: 4px 16px;
    border-radius: 4px;
    font-size: 15px;
    text-align: center;
}

.text-button:hover {
    background-color: #0f95fc;
    opacity: 0.9;
}

@media (max-width: 768px) {
    .sidebar {
        position: absolute;
        top: 0;
        left: 48px;
        height: 100%;
        z-index: 5;
    }
    
    .welcome-actions {
        flex-direction: column;
        gap: 20px;
    }
    
    .status-item {
        padding: 0 4px;
    }
}
</style> 