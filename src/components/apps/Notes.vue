<template>
    <MacWindow 
        title="使用帮助" 
        :isMinimized="isMinimized" 
        @close="closeApp" 
        @minimize="toggleMinimize"
        width="800"
        height="600"
    >
        <div class="notes-container">
            <div class="notes-sidebar">
                <div class="sidebar-header">
                    <h3>笔记</h3>
                    <button class="add-note-btn" title="新建笔记">
                        <i class="el-icon-plus"></i>
                    </button>
                </div>
                <div class="notes-list">
                    <div class="note-item active">
                        <div class="note-title">使用帮助</div>
                        <div class="note-preview">欢迎使用WebAI前端代码生成器...</div>
                    </div>
                </div>
            </div>
            <div class="notes-content">
                <div class="note-editor">
                    <h1>WebAI 前端代码生成器使用帮助</h1>
                    
                    <h2>简介</h2>
                    <p>WebAI 是一款强大的AI驱动的前端代码生成器，帮助用户通过自然语言描述快速创建网页和应用程序界面。</p>
                    
                    <h2>基本使用流程</h2>
                    <ol>
                        <li><strong>点击桌面上的"使用帮助"图标</strong>：了解系统功能和操作方法。</li>
                        <li><strong>打开代码生成器</strong>：通过桌面图标或Dock栏打开前端代码生成器。</li>
                        <li><strong>描述您的需求</strong>：在文本框中输入您想要创建的界面描述。</li>
                        <li><strong>选择配置</strong>：根据需要选择AI模型、UI框架、JS框架等选项。</li>
                        <li><strong>生成代码</strong>：点击"生成代码"按钮，系统将开始生成您描述的界面代码。</li>
                        <li><strong>预览和编辑</strong>：代码生成后，您可以在编辑器中查看并修改代码，同时预览窗口会显示实时效果。</li>
                    </ol>
                    
                    <h2>功能介绍</h2>
                    <h3>1. 代码生成器</h3>
                    <p>通过AI将您的文字描述转换为实际可用的前端代码，支持多种框架和库。</p>
                    <ul>
                        <li><strong>AI模型</strong>：可选择不同的AI模型，如GPT-3.5、GPT-4等，不同模型有不同的能力和特点。</li>
                        <li><strong>UI框架</strong>：支持多种流行的UI框架，如Element UI、Ant Design、Bootstrap等。</li>
                        <li><strong>JS框架</strong>：支持原生JavaScript、Vue、React等多种前端框架。</li>
                        <li><strong>CDN来源</strong>：可选择不同的CDN提供商，以获得更好的加载速度。</li>
                        <li><strong>设备适配</strong>：可选择针对不同设备类型优化的代码生成。</li>
                    </ul>
                    
                    <h3>2. 代码编辑器</h3>
                    <p>内置的代码编辑器允许您查看和修改生成的代码。</p>
                    <ul>
                        <li>支持语法高亮</li>
                        <li>代码格式化</li>
                        <li>自动保存</li>
                    </ul>
                    
                    <h3>3. 实时预览</h3>
                    <p>预览窗口实时显示生成代码的运行效果，帮助您直观地了解代码的表现。</p>
                    
                    <h3>4. 版本管理</h3>
                    <p>系统会自动保存您生成的代码版本，方便您随时回溯或比较不同版本。</p>
                    
                    <h2>使用技巧</h2>
                    <ul>
                        <li><strong>详细描述</strong>：尽量详细描述您想要的界面元素、布局、交互行为等。</li>
                        <li><strong>指定技术栈</strong>：在描述中明确指出您想使用的技术栈，如"使用Vue3和Element Plus创建一个登录表单"。</li>
                        <li><strong>持续对话</strong>：使用"继续对话"功能，可以对已生成的代码进行进一步的修改和完善。</li>
                        <li><strong>保存版本</strong>：重要的代码版本可以在版本管理器中进行标记和命名，方便日后查找。</li>
                    </ul>
                    
                    <h2>常见问题</h2>
                    <p><strong>Q: 为什么我的代码生成速度较慢？</strong></p>
                    <p>A: 代码生成速度受网络状况、服务器负载和所选AI模型的影响。高级模型通常需要更长的处理时间，但生成质量更高。</p>
                    
                    <p><strong>Q: 如何修改已生成的代码？</strong></p>
                    <p>A: 您可以直接在代码编辑器中修改，或使用"继续对话"功能，通过自然语言描述您想要的修改。</p>
                    
                    <p><strong>Q: 我可以导出代码吗？</strong></p>
                    <p>A: 是的，您可以复制代码或使用导出功能将代码保存到本地文件。</p>
                </div>
            </div>
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
.notes-container {
    display: flex;
    height: 100%;
    background-color: #f5f5f5;
    border-radius: 0 0 10px 10px;
}

.notes-sidebar {
    width: 210px;
    background-color: #f2f2f2;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
    margin: 0;
    color: #333;
}

.add-note-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: #007aff;
    cursor: pointer;
}

.notes-list {
    flex: 1;
    overflow-y: auto;
}

.note-item {
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
    cursor: pointer;
}

.note-item:hover {
    background-color: #e9e9e9;
}

.note-item.active {
    background-color: #e2e2e2;
}

.note-title {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}

.note-preview {
    color: #666;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notes-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.note-editor {
    flex: 1;
    padding: 20px;
    background: white;
    overflow-y: auto;
    line-height: 1.6;
}

.note-editor h1 {
    color: #333;
    font-size: 24px;
    margin-top: 0;
    margin-bottom: 20px;
}

.note-editor h2 {
    color: #444;
    font-size: 20px;
    margin-top: 25px;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}

.note-editor h3 {
    color: #555;
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 10px;
}

.note-editor p {
    margin-bottom: 15px;
}

.note-editor ul, .note-editor ol {
    margin-bottom: 15px;
    padding-left: 25px;
}

.note-editor li {
    margin-bottom: 8px;
}

.note-editor strong {
    font-weight: 600;
}
</style> 