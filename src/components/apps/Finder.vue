<template>
    <MacWindow 
        title="Finder" 
        :isMinimized="isMinimized" 
        @close="closeApp" 
        @minimize="toggleMinimize"
        width="800"
        height="600"
    >
        <div class="finder-container">
            <!-- 侧边栏 -->
            <div class="finder-sidebar">
                <div class="sidebar-section">
                    <div class="section-title">收藏</div>
                    <div class="sidebar-item active" @click="showAllProjects">
                        <el-icon><Folder /></el-icon>
                        <span>项目</span>
                    </div>
                    <div class="sidebar-item" @click="filterRecentProjects">
                        <el-icon><Clock /></el-icon>
                        <span>最近</span>
                    </div>
                </div>
            </div>

            <!-- 主内容区 -->
            <div class="finder-content">
                <!-- 顶部操作栏 -->
                <div class="finder-toolbar">
                    <div class="view-controls">
                        <el-radio-group v-model="viewMode" size="small">
                            <el-radio-button value="grid">
                                <el-icon><Grid /></el-icon>
                            </el-radio-button>
                            <el-radio-button value="list">
                                <el-icon><List /></el-icon>
                            </el-radio-button>
                        </el-radio-group>
                    </div>
                    
                    <div class="path-navigator">
                        <template v-if="selectedProject">
                            <el-button link @click="showAllProjects">项目</el-button>
                            <span class="path-separator">/</span>
                            <span class="current-path">{{ selectedProject.title }}</span>
                        </template>
                        <template v-else>
                            <span class="current-path">项目</span>
                        </template>
                    </div>
                    
                    <div class="search-box">
                        <el-input
                            v-model="searchQuery"
                            placeholder="搜索"
                            :prefix-icon="Search"
                            clearable
                            size="small"
                        />
                    </div>
                </div>

                <!-- 项目列表视图 -->
                <div v-if="!selectedProject" :class="['projects-container', viewMode]">
                    <div v-if="loading" class="loading-container">
                        <el-icon class="loading-icon"><Loading /></el-icon>
                        <p>加载中...</p>
                    </div>

                    <el-empty v-else-if="filteredProjects.length === 0" description="暂无项目" />

                    <template v-else>
                        <!-- 网格视图 -->
                        <template v-if="viewMode === 'grid'">
                            <div 
                                v-for="project in filteredProjects" 
                                :key="project.id"
                                class="project-item"
                                @click="openProject(project)"
                                @dblclick="openProject(project)"
                            >
                                <div class="project-icon">
                                    <el-icon><Folder /></el-icon>
                                </div>
                                <div class="project-name">{{ project.projectName }}</div>
                                <div class="project-meta">
                                    {{ project.versionsCount || 0 }} 个版本
                                    <span v-if="project.updateTime" class="project-update">
                                        · {{ formatDate(project.updateTime * 1000) }}
                                    </span>
                                </div>
                            </div>
                        </template>

                        <!-- 列表视图 -->
                        <el-table
                            v-else
                            :data="filteredProjects"
                            style="width: 100%"
                            @row-click="openProject"
                            @row-dblclick="openProject"
                        >
                            <el-table-column label="名称" min-width="200">
                                <template #default="{ row }">
                                    <div class="list-item-name">
                                        <el-icon><Folder /></el-icon>
                                        <span>{{ row.projectName }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="versionsCount" label="版本数量" width="100" />
                            <el-table-column label="最新版本" min-width="150">
                                <template #default="{ row }">
                                    {{ row.lastVersion ? row.lastVersion.substring(0, 8) + '...' : '-' }}
                                </template>
                            </el-table-column>
                            <el-table-column label="更新时间" width="180">
                                <template #default="{ row }">
                                    {{ formatDate(row.updateTime * 1000) }}
                                </template>
                            </el-table-column>
                        </el-table>
                    </template>
                </div>

                <!-- 项目详情视图 (显示版本列表) -->
                <div v-else :class="['versions-container', viewMode]">
                    <div v-if="projectLoading" class="loading-container">
                        <el-icon class="loading-icon"><Loading /></el-icon>
                        <p>加载中...</p>
                    </div>

                    <el-empty v-else-if="projectVersions.length === 0" description="此项目暂无版本" />

                    <template v-else>
                        <!-- 网格视图 -->
                        <template v-if="viewMode === 'grid'">
                            <div 
                                v-for="version in projectVersions" 
                                :key="version.id"
                                class="version-item"
                                @click="selectVersion(version)"
                                @dblclick="openVersionPreview(version)"
                            >
                                <div class="version-icon">
                                    <el-icon><Document /></el-icon>
                                </div>
                                <div class="version-name">{{ version.title || `版本 ${formatDate(version.timestamp * 1000)}` }}</div>
                                <div class="version-meta">
                                    {{ formatDate(version.timestamp * 1000) }}
                                </div>
                                <div class="version-prompt" v-if="version.prompt">
                                    <el-tooltip :content="version.prompt" placement="top" effect="dark">
                                        <el-icon><InfoFilled /></el-icon>
                                    </el-tooltip>
                                </div>
                            </div>
                        </template>

                        <!-- 列表视图 -->
                        <el-table
                            v-else
                            :data="projectVersions"
                            style="width: 100%"
                            @row-click="selectVersion"
                            @row-dblclick="openVersionPreview"
                        >
                            <el-table-column label="名称" min-width="200">
                                <template #default="{ row }">
                                    <div class="list-item-name">
                                        <el-icon><Document /></el-icon>
                                        <span>{{ row.title || `版本 ${formatDate(row.timestamp * 1000)}` }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="提示" min-width="200">
                                <template #default="{ row }">
                                    <el-tooltip :content="row.prompt" placement="top" effect="dark" v-if="row.prompt">
                                        <span class="prompt-preview">{{ row.prompt.substring(0, 30) }}{{ row.prompt.length > 30 ? '...' : '' }}</span>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                            <el-table-column label="创建时间" width="180">
                                <template #default="{ row }">
                                    {{ formatDate(row.timestamp * 1000) }}
                                </template>
                            </el-table-column>
                            <!-- <el-table-column label="操作" width="150">
                                <template #default="{ row }">
                                    <el-button link @click.stop="openVersionPreview(row)">预览</el-button>
                                    <el-button link @click.stop="loadVersionToEditor(row)">编辑</el-button>
                                </template>
                            </el-table-column> -->
                        </el-table>
                    </template>
                </div>

                <!-- 底部状态栏 -->
                <div class="finder-statusbar">
                    <div v-if="selectedProject">
                        {{ projectVersions.length }} 个版本, {{ formatFileSize(getTotalSize()) }}
                    </div>
                    <div v-else>
                        {{ filteredProjects.length }} 个项目
                    </div>
                </div>
            </div>
        </div>
    </MacWindow>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import MacWindow from '@/components/common/MacWindow.vue';
import { ElMessage } from 'element-plus';
import { Folder, Document, Loading, Grid, List, Clock, Search, InfoFilled } from '@element-plus/icons-vue';
import { getUserProjects, getProjectById, getProjectVersionCode } from '@/utils/apiService';

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
const emit = defineEmits(['close', 'minimize', 'openApp']);

// 状态变量
const loading = ref(false);
const projectLoading = ref(false);
const projects = ref([]);
const searchQuery = ref('');
const viewMode = ref('grid');
const selectedProject = ref(null);
const projectVersions = ref([]);
const selectedVersion = ref(null);

// 关闭应用
const closeApp = () => {
    emit('close');
};

// 切换最小化状态
const toggleMinimize = () => {
    emit('minimize');
};

// 过滤项目
const filteredProjects = computed(() => {
    if (!searchQuery.value) {
        return projects.value;
    }
    
    const query = searchQuery.value.toLowerCase();
    return projects.value.filter(project => 
        (project.projectName && project.projectName.toLowerCase().includes(query)) || 
        (project.description && project.description.toLowerCase().includes(query)) ||
        (project.prompt && project.prompt.toLowerCase().includes(query))
    );
});

// 显示所有项目
const showAllProjects = () => {
    selectedProject.value = null;
    selectedVersion.value = null;
    loadProjects();
};

// 过滤最近项目
const filterRecentProjects = () => {
    // 显示最近7天内更新的项目
    const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60); // 一周前的时间戳（秒）
    
    selectedProject.value = null;
    selectedVersion.value = null;
    
    // 过滤并保留最近7天更新的项目
    const filteredList = projects.value.filter(project => 
        project.updateTime && project.updateTime >= oneWeekAgo
    );
    
    // 如果过滤后没有项目，显示提示信息
    if (filteredList.length === 0) {
        ElMessage.info('没有最近7天内更新的项目');
        // 保持原始项目列表不变，但显示提示
        return;
    }
    
    // 更新项目列表为过滤后的列表
    projects.value = filteredList;
};

// 打开项目
const openProject = (project) => {
    selectedProject.value = {
        ...project,
        title: project.projectName // 使用projectName作为title，保持UI一致性
    };
    loadProjectVersions(project.projectId);
};

// 选择版本
const selectVersion = (version) => {
    selectedVersion.value = version;
};

// 打开版本预览
const openVersionPreview = (version) => {
    if (!selectedProject.value || !version) return;
    
    // 构建预览URL
    const previewUrl = `/api/projects/${selectedProject.value.projectId}/versions/${version.versionId}/html`;
    // 在新窗口打开预览
    window.open(previewUrl, '_blank');
};

// 加载版本到编辑器
const loadVersionToEditor = async (version) => {
    if (!selectedProject.value || !version) return;
    
    try {
        // 获取HTML内容
        const html = await getProjectVersionCode(
            selectedProject.value.projectId, 
            version.versionId
        );
        
        // 加载到编辑器
        emit('openEditor', {
            code: html,
            prompt: version.prompt,
            additionalPrompt: '', // 默认无附加提示
            projectId: selectedProject.value.projectId,
            versionId: version.versionId
        });
        
        // 关闭Finder
        closeApp();
        
    } catch (error) {
        console.error('加载版本到编辑器时出错:', error);
        ElMessage.error('加载版本到编辑器失败');
    }
};

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

// 计算总大小
const getTotalSize = () => {
    // 这里应该是实际文件大小的总和，但由于没有此信息，暂时返回一个估计值
    return 1024 * 1024 * projectVersions.value.length; // 假设每个版本平均1MB
};

// 格式化文件大小
const formatFileSize = (size) => {
    if (size < 1024) {
        return size + ' B';
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
};

// 加载项目列表
const loadProjects = async () => {
    try {
        loading.value = true;
        const data = await getUserProjects();
        projects.value = data.projects || [];
    } catch (error) {
        console.error('加载项目列表时出错:', error);
        ElMessage.error('加载项目列表失败');
    } finally {
        loading.value = false;
    }
};

// 加载项目版本
const loadProjectVersions = async (projectId) => {
    if (!projectId) return;
    
    try {
        projectLoading.value = true;
        const data = await getProjectById(projectId);
        console.log(data)
        if(data.success){
            projectVersions.value = data.project.versions || [];
        }else{
            ElMessage.error('加载项目版本失败');
        }
    } catch (error) {
        console.error('加载项目版本时出错:', error);
        ElMessage.error('加载项目版本失败');
    } finally {
        projectLoading.value = false;
    }
};

// 组件挂载后
onMounted(() => {
    loadProjects();
});
</script>

<style scoped>
.finder-container {
    display: flex;
    height: 100%;
    background-color: #f9f9f9;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.finder-sidebar {
    width: 200px;
    background-color: #f2f2f2;
    border-right: 1px solid #e0e0e0;
    padding: 10px 0;
    overflow-y: auto;
}

.sidebar-section {
    margin-bottom: 20px;
}

.section-title {
    padding: 0 16px;
    font-size: 12px;
    font-weight: 500;
    color: #777;
    margin-bottom: 5px;
    text-transform: uppercase;
}

.sidebar-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 5px;
    margin: 0 4px;
}

.sidebar-item .el-icon {
    margin-right: 8px;
    font-size: 16px;
    color: #666;
}

.sidebar-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-item.active {
    background-color: rgba(0, 123, 255, 0.1);
    color: #007bff;
}

.sidebar-item.active .el-icon {
    color: #007bff;
}

.finder-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.finder-toolbar {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #f7f7f7;
    border-bottom: 1px solid #e0e0e0;
    height: 50px;
}

.view-controls {
    display: flex;
    align-items: center;
}

.path-navigator {
    margin: 0 20px;
    flex: 1;
    display: flex;
    align-items: center;
}

.path-separator {
    margin: 0 8px;
    color: #999;
}

.current-path {
    font-weight: 500;
}

.search-box {
    width: 200px;
}

.projects-container,
.versions-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background-color: #fff;
}

.projects-container.grid,
.versions-container.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    grid-gap: 16px;
}

.project-item,
.version-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    transition: background-color 0.2s;
    height: 118px;
}

.project-item:hover,
.version-item:hover {
    background-color: rgba(0, 0, 0, 0.03);
}

.project-icon,
.version-icon {
    font-size: 40px;
    margin-bottom: 8px;
    color: #007bff;
}

.version-icon {
    color: #28a745;
}

.project-name,
.version-name {
    font-size: 13px;
    margin-bottom: 4px;
    word-break: break-word;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.project-meta,
.version-meta {
    font-size: 11px;
    color: #777;
}

.list-item-name {
    display: flex;
    align-items: center;
}

.list-item-name .el-icon {
    margin-right: 8px;
    font-size: 18px;
    color: #007bff;
}

.versions-container .list-item-name .el-icon {
    color: #28a745;
}

.finder-statusbar {
    height: 24px;
    background-color: #f7f7f7;
    border-top: 1px solid #e0e0e0;
    font-size: 12px;
    color: #777;
    padding: 0 16px;
    display: flex;
    align-items: center;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    width: 100%;
}

/* 添加空状态居中样式 */
.projects-container :deep(.el-empty),
.versions-container :deep(.el-empty) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
}

/* 确保容器有相对定位以便正确定位空状态提示 */
.projects-container,
.versions-container {
    position: relative;
}

.loading-icon {
    font-size: 32px;
    color: #409eff;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.project-update {
    color: #999;
    font-size: 0.9em;
}

.version-prompt {
    position: absolute;
    top: 8px;
    right: 8px;
    color: #409eff;
}

.version-item {
    position: relative;
}

.prompt-preview {
    color: #666;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

.version-item:hover .version-prompt {
    opacity: 1;
}

.version-prompt .el-icon {
    font-size: 16px;
}
</style> 