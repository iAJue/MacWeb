import { post, get } from './request';

const API_BASE_URL = 'https://ai.moejue.cn';

/**
 * 注册新用户
 * @param {string} fingerprint - 浏览器指纹
 * @param {string} inviteCode - 使用的邀请码
 * @returns {Promise<object>} - API响应
 */
export const registerUser = (fingerprint, inviteCode) => {
    return post('/api/register', { fingerprint, inviteCode });
};

/**
 * 获取当前用户信息
 * @returns {Promise<object>} - 用户信息对象
 */
export const getCurrentUser = () => {
    return get('/api/me');
};

/**
 * 获取用户签到状态
 * @returns {Promise<object>} - 签到状态信息，包含连续签到天数、已签到日期等
 */
export const getSignInStatus = () => {
    return get('/api/sign-in/status');
};

/**
 * 执行每日签到
 * @returns {Promise<object>} - 签到结果，包含获得的积分和消息等信息
 */
export const signIn = () => {
    return post('/api/sign-in', {});
};

/**
 * 通过 Server-Sent Events (SSE) 流式生成代码。
 * @param {object} params - 生成参数，包含 description, model, style, uiLibrary, jsFramework, cdnProvider, deviceType, browserFingerprint。
 * @param {function} onData - 处理接收到代码片段的回调函数，接收解析后的JSON数据。
 * @param {function} onComplete - 处理生成完成事件的回调函数，接收解析后的JSON数据（可能包含最终projectId）。
 * @param {function} onError - 处理错误事件或网络错误的回调函数。
 */
export const generateCodeStream = async (params, onData, onComplete, onError) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '网络请求错误' }));
            throw new Error(errorData.message || `网络请求错误: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                // 正常结束，但如果SSE没有显式发送complete事件，可能需要在这里处理
                // 通常complete事件会处理结束逻辑
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // 保留下一次可能不完整的消息

            lines.forEach(line => {
                if (!line) return;
                
                let event = 'message'; // 默认事件类型
                let data = '';

                const eventMatch = line.match(/^event: (.*)$/m);
                if (eventMatch) {
                    event = eventMatch[1].trim();
                }

                const dataMatch = line.match(/^data: (.*)$/m);
                if (dataMatch) {
                    data = dataMatch[1].trim();
                } else if (line.startsWith('data:')) { // 处理只有 data: 的情况
                    data = line.substring(5).trim();
                }

                if (!data) return; // 没有有效数据

                try {
                    const jsonData = JSON.parse(data);
                    if (event === 'message' || event === 'data') { // 后端可能只发送 data
                        onData(jsonData);
                    } else if (event === 'complete') {
                        onComplete(jsonData);
                    } else if (event === 'error') {
                        console.error('SSE Error Event:', jsonData);
                        onError(jsonData.error || '未知SSE错误事件');
                    }
                } catch (e) {
                    console.error('解析SSE数据出错:', e, '原始数据:', data);
                    // 如果解析失败，但事件是 error，仍然尝试调用 onError
                    if (event === 'error') {
                         onError('无法解析的SSE错误事件: ' + data);
                    }
                    // 可以选择忽略无法解析的非错误事件，或者将其作为普通文本处理
                }
            });
        }
        // 确保最后的 buffer 也被处理（如果需要）
        // 通常不需要，因为 complete 事件会标志结束

    } catch (error) {
        console.error('SSE 连接或处理错误:', error);
        onError(error.message || '连接或处理SSE时发生未知错误');
    }
};

/**
 * 通过 Server-Sent Events (SSE) 流式处理继续对话请求
 * @param {object} params - 参数对象，包含 projectId, originalPrompt, additionalPrompt, currentCode, model
 * @param {function} onData - 处理接收到代码片段的回调函数
 * @param {function} onComplete - 处理生成完成事件的回调函数
 * @param {function} onError - 处理错误事件的回调函数
 */
export const continueConversationStream = async (params, onData, onComplete, onError) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/continue-conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '网络请求错误' }));
            throw new Error(errorData.message || `网络请求错误: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // 保留可能不完整的消息

            lines.forEach(line => {
                if (!line) return;
                
                let event = 'message'; // 默认事件类型
                let data = '';

                const eventMatch = line.match(/^event: (.*)$/m);
                if (eventMatch) {
                    event = eventMatch[1].trim();
                }

                const dataMatch = line.match(/^data: (.*)$/m);
                if (dataMatch) {
                    data = dataMatch[1].trim();
                } else if (line.startsWith('data:')) {
                    data = line.substring(5).trim();
                }

                if (!data) return;

                try {
                    const jsonData = JSON.parse(data);
                    if (event === 'message' || event === 'data') {
                        onData(jsonData);
                    } else if (event === 'complete') {
                        onComplete(jsonData);
                    } else if (event === 'error') {
                        console.error('SSE Error Event:', jsonData);
                        onError(jsonData.error || '未知SSE错误事件');
                    }
                } catch (e) {
                    console.error('解析SSE数据出错:', e, '原始数据:', data);
                    if (event === 'error') {
                        onError('无法解析的SSE错误事件: ' + data);
                    }
                }
            });
        }
    } catch (error) {
        console.error('SSE 连接或处理错误:', error);
        onError(error.message || '连接或处理SSE时发生未知错误');
    }
};

/**
 * 获取用户项目列表
 * @returns {Promise<object>} - 项目列表响应
 */
export const getUserProjects = () => {
    return get('/api/projects');
};

/**
 * 获取项目详情及其版本列表
 * @param {string} projectId - 项目ID
 * @returns {Promise<object>} - 项目详情响应
 */
export const getProjectById = (projectId) => {
    return get(`/api/projects/${projectId}`);
};

/**
 * 获取项目版本的HTML代码
 * @param {string} projectId - 项目ID
 * @param {string} versionId - 版本ID
 * @returns {Promise<string>} - HTML代码内容
 */
export const getProjectVersionCode = (projectId, versionId) => {
    return get(`/api/projects/${projectId}/versions/${versionId}/html`, {}, 'text');
};


/**
 * 更新项目
 * @param {string} projectId - 项目ID
 * @param {object} projectData - 更新的项目数据
 * @returns {Promise<object>} - 更新结果
 */
export const updateProject = (projectId, projectData) => {
    return post(`/api/projects/${projectId}`, projectData, 'PUT');
};

/**
 * 删除项目
 * @param {string} projectId - 要删除的项目ID
 * @returns {Promise<object>} - 删除结果
 */
export const deleteProject = (projectId) => {
    return post(`/api/projects/${projectId}`, {}, 'DELETE');
};

/**
 * 获取所有AI模型的积分消耗配置
 * @returns {Promise<Object>} - 包含所有模型积分消耗配置的对象
 */
export const getModelCreditCosts = async () => {
    return await get('/api/credit-costs');
};