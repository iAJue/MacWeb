<template>
    <div class="calendar-popup">
        <div class="calendar-header">
            <h3>{{ currentDate }}</h3>
            <button @click="closeCalendar">关闭</button>
        </div>
        <div class="calendar-content">
            <div class="calendar-item">今天没有日程安排</div>
            <div class="calendar-item">点击"+"添加新事件</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 事件发射
const emit = defineEmits(['close']);

// 当前日期
const currentDate = ref('');

// 关闭日历
const closeCalendar = () => {
    emit('close');
};

// 更新日期
const updateDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    currentDate.value = `${month}月${day}日 星期${weekday}`;
};

// 组件挂载后初始化
onMounted(() => {
    updateDate();
});
</script>

<style scoped>
/* 日历弹窗 */
.calendar-popup {
    position: fixed;
    top: 35px;
    right: 10px;
    width: 280px;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1900;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.calendar-header {
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.calendar-header h3 {
    margin: 0;
    font-size: 14px;
    color: #333;
}

.calendar-header button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 3px 8px;
    border-radius: 4px;
}

.calendar-header button:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.calendar-content {
    padding: 15px;
}

.calendar-item {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    color: #666;
    font-size: 13px;
}

.calendar-item:last-child {
    border-bottom: none;
}
</style> 