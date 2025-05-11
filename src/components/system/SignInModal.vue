<template>
    <el-dialog
        v-model="dialogVisible"
        title="每日签到"
        width="400px"
        custom-class="sign-in-dialog"
        :show-close="true"
        :close-on-click-modal="false"
        :close-on-press-escape="true"
        @close="closeDialog"
    >
        <div class="sign-in-container">
            <div class="sign-in-header">
                <div class="consecutive-days">
                    <span class="days-count">{{ signInData.consecutiveDays }}</span>
                    <span class="days-text">连续签到天数</span>
                </div>
                <div class="next-reward">
                    <div class="reward-text">下次签到可获得</div>
                    <div class="reward-amount">{{ signInData.nextReward }} 积分</div>
                </div>
            </div>

            <div class="calendar-container">
                <div class="calendar-header">
                    <span>{{ currentMonth }}月 {{ currentYear }}</span>
                </div>
                <div class="weekdays">
                    <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                </div>
                <div class="calendar-days">
                    <div
                        v-for="day in calendarDays"
                        :key="day.date"
                        class="calendar-day"
                        :class="{
                            'empty': !day.date,
                            'signed': day.signed,
                            'today': day.isToday,
                            'future': day.isFuture
                        }"
                    >
                        <span v-if="day.date">{{ day.date }}</span>
                        <el-icon v-if="day.signed" class="signed-icon"><Check /></el-icon>
                    </div>
                </div>
            </div>

            <div class="sign-in-button-container">
                <el-button
                    type="primary"
                    class="sign-in-button"
                    :disabled="signInData.hasSigned"
                    @click="handleSignIn"
                    :loading="loading"
                >
                    {{ signInData.hasSigned ? '今日已签到' : '立即签到' }}
                </el-button>
            </div>

            <div class="credit-rules">
                <div class="rule-title">签到规则</div>
                <div class="rule-item">
                    <div class="rule-days">连续签到1-2天</div>
                    <div class="rule-credits">+100积分/天</div>
                </div>
                <div class="rule-item">
                    <div class="rule-days">连续签到3-5天</div>
                    <div class="rule-credits">+150积分/天</div>
                </div>
                <div class="rule-item">
                    <div class="rule-days">连续签到6天及以上</div>
                    <div class="rule-credits">+200积分/天</div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getSignInStatus, signIn } from '../../utils/apiService';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible']);

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});

const closeDialog = () => {
    emit('update:visible', false);
};

// 签到数据
const signInData = ref({
    hasSigned: false,
    consecutiveDays: 0,
    signedDates: [],
    nextReward: 100
});

// 当前日期信息
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();

// 加载状态
const loading = ref(false);

// 星期名称
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

// 计算当月的日历数据
const calendarDays = computed(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0-6 代表周日到周六

    const days = [];

    // 添加月初的空白天数
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push({ date: null });
    }

    // 添加月份中的天数
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === currentDay;
        const isFuture = day > currentDay;
        
        // 检查此日期是否有签到记录
        const signed = signInData.value.signedDates.some(d => d.date === day);
        
        days.push({
            date: day,
            signed,
            isToday,
            isFuture
        });
    }

    return days;
});

// 获取签到状态
const fetchSignInStatus = async () => {
    try {
        loading.value = true;
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            ElMessage.warning('请先登录');
            closeDialog();
            return;
        }
        
        const response = await getSignInStatus();
        
        if (response.success) {
            signInData.value = response.data;
        }
    } catch (error) {
        console.error('获取签到状态失败:', error);
        ElMessage.error('获取签到状态失败');
    } finally {
        loading.value = false;
    }
};

// 执行签到
const handleSignIn = async () => {
    try {
        loading.value = true;
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            ElMessage.warning('请先登录');
            closeDialog();
            return;
        }
        
        const response = await signIn();
        
        if (response.success) {
            const result = response.data;
            // 刷新签到状态
            await fetchSignInStatus();
            ElMessage.success(`签到成功！获得 ${result.creditsAdded} 积分`);
        }
    } catch (error) {
        console.error('签到失败:', error);
        if (error.response && error.response.data && error.response.data.message) {
            ElMessage.error(error.response.data.message);
        } else {
            ElMessage.error('签到失败，请稍后再试');
        }
    } finally {
        loading.value = false;
    }
};

// 监听对话框打开，获取签到状态
watchEffect(() => {
    if (dialogVisible.value) {
        fetchSignInStatus();
    }
});
</script>

<style scoped>
.sign-in-dialog :deep(.el-dialog__header) {
    text-align: center;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
}

.sign-in-container {
    padding: 15px;
}

.sign-in-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.consecutive-days {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.days-count {
    font-size: 32px;
    font-weight: bold;
    color: #409EFF;
}

.days-text {
    font-size: 14px;
    color: #666;
}

.next-reward {
    text-align: right;
}

.reward-text {
    font-size: 14px;
    color: #666;
}

.reward-amount {
    font-size: 20px;
    font-weight: bold;
    color: #FF9500;
}

.calendar-container {
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.calendar-header {
    text-align: center;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: bold;
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 10px;
}

.weekday {
    font-size: 14px;
    color: #666;
    padding: 5px 0;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
}

.calendar-day {
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    font-size: 14px;
    border-radius: 4px;
}

.calendar-day.empty {
    background: none;
}

.calendar-day.signed {
    background-color: #409EFF;
    color: white;
}

.calendar-day.today {
    font-weight: bold;
}

.calendar-day.future {
    color: #BBBBBB;
}

.signed-icon {
    position: absolute;
    right: 2px;
    bottom: 2px;
    font-size: 10px;
}

.sign-in-button-container {
    text-align: center;
    margin: 20px 0;
}

.sign-in-button {
    width: 200px;
    height: 44px;
    font-size: 16px;
}

.credit-rules {
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
}

.rule-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
}

.rule-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.rule-days {
    color: #666;
}

.rule-credits {
    color: #FF9500;
    font-weight: bold;
}
</style> 