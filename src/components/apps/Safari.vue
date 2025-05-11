<template>
    <MacWindow title="Safari" :isMinimized="isMinimized" @close="closeApp" @minimize="toggleMinimize"
        :startMaximized="true">
        <div class="preview-content">
            <div class="safari-toolbar">
                <div class="safari-arrow-buttons">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    <el-icon>
                        <ArrowRight />
                    </el-icon>
                </div>
                <div class="safari-address-bar">
                    <el-icon>
                        <Lock />
                    </el-icon>
                    <span>{{ currentUrl }}</span>
                </div>
                <div class="safari-buttons">
                    <el-icon>
                        <Share />
                    </el-icon>
                </div>
            </div>
            <div class="safari-content">
                <iframe v-if="externalUrl" :src="externalUrl" class="preview-frame"></iframe>
                <iframe v-else :srcdoc="previewHtml" class="preview-frame"></iframe>
            </div>
        </div>
    </MacWindow>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { ArrowLeft, ArrowRight, Lock, Share } from '@element-plus/icons-vue';
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
    }
});

// 事件发射
const emit = defineEmits(['close', 'minimize']);

// 状态变量
const externalUrl = ref('');
const currentUrl = ref('localhost');

// 组件挂载时检查是否有外部URL
onMounted(() => {
    const url = localStorage.getItem('safariUrl');
    if (url) {
        externalUrl.value = url;
        currentUrl.value = new URL(url).hostname;
    }
});

// 关闭应用
const closeApp = () => {
    emit('close');
};

// 切换最小化状态
const toggleMinimize = () => {
    emit('minimize');
};

// 计算属性：预览HTML
const previewHtml = computed(() => {
    // 根据代码类型构建不同的预览
    let previewContent = '';
    const code = props.code || '';

    // 如果是HTML或包含HTML标签的内容，直接渲染
    if (code.includes('<html>') ||
        code.includes('<body>')) {
        previewContent = code;
    } else if (code.includes('<template>') && code.includes('<script>')) {
        // Vue单文件组件，用注释提示
        previewContent = `
      <h2>Vue 组件预览</h2>
      <p>这是一个 Vue 单文件组件，需要在 Vue 项目中使用。</p>
      <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
    `;
    } else if (code.includes('@media') || code.includes('@keyframes') ||
        code.includes('{') && code.includes('}') && !code.includes('function')) {
        // CSS预览
        previewContent = `
      <style>${code}</style>
      <div class="css-preview">
        <h2>CSS预览</h2>
        <p>CSS已加载到此页面。请检查应用的样式。</p>
        <div class="demo-elements">
          <button class="btn">按钮</button>
          <div class="box">样式盒子</div>
          <p class="text">文本样例</p>
        </div>
      </div>
    `;
    } else {
        // 其他类型的代码，显示格式化的代码
        previewContent = `
      <h2>代码预览</h2>
      <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
    `;
    }

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            margin: 0;
            line-height: 1.6;
          }
          pre {
            background-color: #f5f7fa;
            padding: 15px;
            border-radius: 4px;
            overflow: auto;
            font-size: 14px;
          }
          code {
            font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
          }
          .demo-elements {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .btn {
            padding: 8px 16px;
            border: 1px solid #ccc;
            border-radius: 6px;
            cursor: pointer;
            width: fit-content;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .box {
            width: 100px;
            height: 100px;
            background: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        ${previewContent}
      </body>
    </html>
  `;
});
</script>

<style scoped>
.preview-content {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* Safari风格预览窗口 */
.safari-toolbar {
    display: flex;
    align-items: center;
    background-color: #f8f8f8;
    border-bottom: 1px solid #e0e0e0;
    padding: 10px;
}

.safari-arrow-buttons {
    display: flex;
    gap: 10px;
    margin-right: 15px;
}

.safari-address-bar {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #e9e9e9;
    border-radius: 6px;
    padding: 0 10px;
    height: 28px;
    margin: 0 10px;
    font-size: 13px;
    color: #333;
}

.safari-address-bar .el-icon {
    margin-right: 6px;
    font-size: 14px;
    color: #00890a;
}

.safari-buttons {
    margin-left: 10px;
}

.safari-content {
    flex: 1;
    height: calc(100% - 50px);
}

.preview-frame {
    width: 100%;
    height: 100%;
    border: none;
}
</style>