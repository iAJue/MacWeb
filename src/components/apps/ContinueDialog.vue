<template>
    <MacWindow title="继续对话" :isMinimized="isMinimized" @close="closeApp" @minimize="toggleMinimize" width="700"
        height="500">
        <div class="continue-dialog">
            <div class="dialog-content">
                <div class="original-prompt">
                    <h4>原始提示</h4>
                    <el-input type="textarea" :value="originalPrompt" :rows="3" placeholder="原始提示内容" readonly />
                </div>

                <div class="continue-prompt">
                    <h4>继续对话</h4>
                    <el-input type="textarea" v-model="continuePrompt" :rows="6"
                        placeholder="请输入您想要继续对话的内容，描述需要修改或优化的部分..." :disabled="isGenerating" />
                </div>

                <div class="ai-model-selection">
                    <h4>AI模型选择</h4>
                    <el-select v-model="selectedModel" placeholder="请选择AI模型">
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


                <div class="dialog-actions">
                    <el-button @click="closeApp">取消</el-button>
                    <el-button type="primary" @click="submitContinueDialog" :loading="isGenerating"
                        :disabled="!continuePrompt || isGenerating">
                        {{ isGenerating ? '生成中...' : '继续生成' }}
                    </el-button>
                </div>
            </div>
        </div>
    </MacWindow>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import MacWindow from '@/components/common/MacWindow.vue';
import { continueConversationStream, getModelCreditCosts } from '@/utils/apiService';

// 定义属性
const props = defineProps({
    isMinimized: {
        type: Boolean,
        default: false
    },
    projectId: {
        type: String,
        default: ''
    },
    versionId: {
        type: String,
        default: ''
    },
    originalPrompt: {
        type: String,
        default: ''
    },
    currentCode: {
        type: String,
        default: ''
    }
});

// 事件发射
const emit = defineEmits(['close', 'minimize', 'codeGenerated']);

// 状态变量
const continuePrompt = ref('');
const selectedModel = ref('gpt-3.5-turbo');
const isGenerating = ref(false);
const localOriginalPrompt = ref(props.originalPrompt);
const modelCreditCosts = ref({});

// 监听props变化
watch(
    () => props.originalPrompt,
    (newVal) => {
        localOriginalPrompt.value = newVal;
    }
);

// 关闭应用
const closeApp = () => {
    emit('close');
};

// 切换最小化状态
const toggleMinimize = () => {
    emit('minimize');
};

// 提交继续对话
const submitContinueDialog = async () => {
    if (!continuePrompt.value) {
        ElMessage.warning('请输入继续对话的内容');
        return;
    }

    try {
        isGenerating.value = true;
        let generatedCode = '';

        // 准备请求参数
        const params = {
            projectId: props.projectId || '',
            versionId: props.versionId || '',
            originalPrompt: localOriginalPrompt.value || props.originalPrompt || '',
            additionalPrompt: continuePrompt.value,
            currentCode: props.currentCode || '',
            model: selectedModel.value
        };

        // 使用封装的API服务处理SSE流
        await continueConversationStream(
            params,
            // 接收数据的回调
            (data) => {
                if (data.code) {
                    generatedCode += data.code;
                }
            },
            // 完成的回调
            async (data) => {
                console.log('继续生成完成，data:', data);
                isGenerating.value = false;
                if (generatedCode) {
                    emit('codeGenerated', generatedCode, continuePrompt.value);
                    closeApp();
                } else {
                    ElMessage.warning('没有收到任何生成的代码');
                }
            },
            // 错误的回调
            (error) => {
                isGenerating.value = false;
                ElMessage.error(`生成代码时发生错误: ${error}`);
            }
        );
    } catch (error) {
        console.error('继续生成代码错误:', error);
        isGenerating.value = false;
        ElMessage.error(`生成代码时发生错误: ${error.message || '未知错误'}`);
    }
};

onMounted(async () => {
    try {
        const costsResponse = await getModelCreditCosts();
        modelCreditCosts.value = costsResponse.data;
        
        if (Object.keys(modelCreditCosts.value).length > 0) {
            const models = Object.keys(modelCreditCosts.value);
            selectedModel.value = models[models.length - 1];
        }
    } catch (error) {
        ElMessage.error('获取模型积分配置失败，请刷新页面重试');
    }
});
</script>

<style scoped>
.continue-dialog {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.dialog-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.original-prompt h4,
.continue-prompt h4,
.ai-model-selection h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
    font-size: 14px;
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.ai-model-selection {
    width: 300px;
}

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