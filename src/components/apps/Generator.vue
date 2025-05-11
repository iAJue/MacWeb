<template>
    <MacWindow 
        title="Web AI - 前端代码生成" 
        :isMinimized="isMinimized" 
        @close="closeApp" 
        @minimize="toggleMinimize"
        width="800"
        height="600"
    >
        <el-form :model="form" label-width="120px" style="padding: 20px;">
            <el-form-item label="描述内容">
                <el-input v-model="form.description" type="textarea" :rows="4"
                    placeholder="请描述您想要生成的前端代码（HTML/CSS/JavaScript/Vue/React等）..."
                    @focus.stop
                    @click.stop
                    ref="descriptionInputRef" />
            </el-form-item>
            <el-form-item label="AI模型选择">
                <div class="model-selection-wrapper" style="width: 300px;">
                    <el-select v-model="form.model" placeholder="请选择AI模型">
                        <el-option 
                            v-for="(cost, model) in modelCreditCosts" 
                            :key="model" 
                            :label="`${model} (${cost}积分)`" 
                            :value="model" 
                        >
                            <div class="model-option">
                                <span>{{ model }}</span>
                                <span class="credit-badge">{{ cost }}积分</span>
                            </div>
                        </el-option>
                    </el-select>
                </div>
            </el-form-item>

            <el-form-item label="UI框架选择">
                <el-select v-model="form.uiLibrary" placeholder="请选择UI框架">
                    <el-option label="原生样式" value="native" />
                    <el-option label="Element UI" value="element-ui" />
                    <el-option label="Element Plus" value="element-plus" />
                    <el-option label="Layui" value="layui" />
                    <el-option label="Bootstrap" value="bootstrap" />
                    <el-option label="Ant Design" value="ant-design" />
                    <el-option label="Tailwind CSS" value="tailwind" />
                </el-select>
            </el-form-item>

            <el-form-item label="JS框架选择">
                <el-select v-model="form.jsFramework" placeholder="请选择JS框架">
                    <el-option label="原生JavaScript" value="vanilla" />
                    <el-option label="jQuery" value="jquery" />
                    <el-option label="Vue 2" value="vue2" />
                    <el-option label="Vue 3" value="vue3" />
                    <el-option label="React" value="react" />
                    <el-option label="Alpine.js" value="alpine" />
                </el-select>
            </el-form-item>

            <el-form-item label="UI界面风格">
                <el-select v-model="form.uiStyle" placeholder="请选择UI界面风格">
                    <el-option label="现代简约" value="modern" />
                    <el-option label="暗黑风格" value="dark" />
                    <el-option label="明亮风格" value="light" />
                    <el-option label="极简主义" value="minimalist" />
                    <el-option label="Bento Box" value="bento" />
                    <el-option label="玻璃态" value="glassmorphism" />
                    <el-option label="新拟物" value="neumorphism" />
                    <el-option label="复古" value="retro" />
                </el-select>
            </el-form-item>

            <el-form-item label="CDN来源">
                <el-select v-model="form.cdnProvider" placeholder="请选择CDN来源">
                    <el-option label="自动选择" value="auto" />
                    <el-option label="jsDelivr" value="jsdelivr" />
                    <el-option label="百度CDN" value="baidu" />
                    <el-option label="Unpkg" value="unpkg" />
                    <el-option label="Cloudflare" value="cloudflare" />
                    <el-option label="七牛云" value="qiniu" />
                    <el-option label="BootCDN" value="bootcdn" />
                </el-select>
            </el-form-item>

            <el-form-item label="设备适配">
                <el-select v-model="form.deviceType" placeholder="请选择设备适配类型">
                    <el-option label="响应式设计" value="responsive" />
                    <el-option label="桌面网页版" value="desktop" />
                    <el-option label="移动端" value="mobile" />
                    <el-option label="平板设备" value="tablet" />
                    <el-option label="多设备兼容" value="multi-device" />
                </el-select>
            </el-form-item>

            <el-form-item label="代码风格">
                <el-select v-model="form.style" placeholder="请选择代码风格">
                    <el-option label="简洁风格" value="simple" />
                    <el-option label="详细注释" value="detailed" />
                    <el-option label="函数式编程" value="functional" />
                    <el-option label="面向对象" value="oop" />
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="generateCode" :loading="isGenerating">
                    {{ isGenerating ? '生成中...' : '生成代码' }}
                </el-button>
            </el-form-item>
        </el-form>
    </MacWindow>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import MacWindow from '@/components/common/MacWindow.vue';
import { generateCodeStream, getModelCreditCosts } from '@/utils/apiService';

// 定义属性
const props = defineProps({
    isMinimized: {
        type: Boolean,
        default: false
    },
    browserFingerprint: {
        type: String,
        default: ''
    }
});

// 事件发射
const emit = defineEmits(['close', 'minimize', 'updateGeneratedCode', 'updateSessionInfo', 'openApp']);

// 表单数据
const form = ref({
    description: '',
    model: 'gpt-3.5-turbo',
    style: 'simple',
    uiLibrary: 'native',
    jsFramework: 'vanilla',
    uiStyle: 'modern',
    cdnProvider: 'auto',
    deviceType: 'responsive'
});

// 状态变量
const isGenerating = ref(false);
const currentGeneratedCode = ref(''); // 用于累积代码
const projectId = ref(''); // 项目ID
const versionId = ref(''); // 版本ID
const modelCreditCosts = ref({}); // 用户积分信息

onMounted(async () => {
    try {
        const costsResponse = await getModelCreditCosts();
        modelCreditCosts.value = costsResponse.data;
        
        // 设置默认选中最后一个模型
        if (Object.keys(modelCreditCosts.value).length > 0) {
            const models = Object.keys(modelCreditCosts.value);
            form.value.model = models[models.length - 1];
        }
    } catch (error) {
        ElMessage.error('获取模型积分配置失败，请刷新页面重试');
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

// 生成代码方法
const generateCode = async () => {
    if (!form.value.description) {
        ElMessage.warning('请输入描述内容');
        return;
    }

    isGenerating.value = true;
    currentGeneratedCode.value = '// 代码正在生成中...\n// 请稍候...';
    projectId.value = ''; 

    // 立刻更新编辑器显示加载状态
    emit('updateGeneratedCode', currentGeneratedCode.value);
    emit('updateSessionInfo', form.value.description, projectId.value, false);

    const params = {
        description: form.value.description,
        model: form.value.model,
        style: form.value.style,
        uiLibrary: form.value.uiLibrary,
        jsFramework: form.value.jsFramework,
        uiStyle: form.value.uiStyle,
        cdnProvider: form.value.cdnProvider,
        deviceType: form.value.deviceType,
        browserFingerprint: props.browserFingerprint || localStorage.getItem('browserFingerprint') || ''
    };

    // 定义SSE事件处理回调
    const handleData = (data) => {
        if (data.error) {
            ElMessage.error(data.message);
            isGenerating.value = false;
            return;
        }

        if (data.code) {
            if (currentGeneratedCode.value.startsWith('// 代码正在生成中')) {
                currentGeneratedCode.value = '';
            }
            currentGeneratedCode.value += data.code;
            emit('updateGeneratedCode', currentGeneratedCode.value);
            
            if (data.projectId && !projectId.value) {
                projectId.value = data.projectId;
                emit('updateSessionInfo', form.value.description, data.projectId, false);
            }
        }
    };

    const handleComplete = (data) => {
        isGenerating.value = false;
        if (data && data.projectId) {
            projectId.value = data.projectId;
            versionId.value = data.versionId;
        }
        
        console.log('生成完成，最终项目ID:', projectId.value);
        console.log('生成完成，最终版本ID:', versionId.value);
        ElMessage.success('代码生成完成');
        
        emit('updateGeneratedCode', currentGeneratedCode.value);
        
        const isCodeGenerating = currentGeneratedCode.value.includes('// 代码正在生成中');
        emit('updateSessionInfo', form.value.description, projectId.value, versionId.value, !isCodeGenerating);
        
        emit('openApp', 'safari');
    };

    const handleError = (errorMessage) => {
        console.error('SSE Error Callback:', errorMessage);
        isGenerating.value = false;
        ElMessage.error('生成代码时发生错误: ' + errorMessage);
        currentGeneratedCode.value += `\n\n// 生成代码时发生错误: ${errorMessage}`;
        emit('updateGeneratedCode', currentGeneratedCode.value);
        emit('updateSessionInfo', form.value.description, projectId.value, false);
    };

    // 调用apiService中的方法
    await generateCodeStream(params, handleData, handleComplete, handleError);
};
</script>

<style scoped>
.model-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.credit-badge {
    background-color: #f0f9eb;
    color: #67c23a;
    border-radius: 10px;
    padding: 1px 4px;
    font-size: 13px;
    border: 1px solid #e1f3d8;
    line-height: 13px;
    margin-left: 10px;
}
</style> 