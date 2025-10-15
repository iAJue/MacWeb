/**
 * 模拟数据文件
 * 包含所有API接口的模拟数据
 */

// 模拟数据
export const mockData = {
    // 用户注册模拟数据
    register: {
        success: true,
        message: '注册成功',
        data: {
            user: {
                id: 'mock_user_123',
                fingerprint: 'mock_fingerprint',
                inviteCode: 'MOCK123',
                createdAt: new Date().toISOString(),
                credits: 100
            },
            token: 'mock_auth_token_123456789'
        }
    },

    // 获取当前用户信息模拟数据
    getCurrentUser: {
        success: true,
        user: {
            id: 'mock_user_123',
            username: '测试用户',
            email: 'test@example.com',
            avatarUrl: '/assets/profile.jpg',
            memberLevel: 1, // 0=免费用户, 1=基础会员, 2=高级会员, 3=专业会员
            registrationDate: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000), // 30天前注册
            lastLoginDate: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000), // 2小时前登录
            freeCredits: 150,
            paidCredits: 500,
            totalSignInDays: 5,
            lastSignInDate: new Date().toISOString(),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            projects: []
        }
    },

    // 签到状态模拟数据
    getSignInStatus: {
        success: true,
        data: {
            hasSigned: false,
            consecutiveDays: 5,
            signedDates: [
                { date: 1, month: 12, year: 2024 },
                { date: 2, month: 12, year: 2024 },
                { date: 3, month: 12, year: 2024 },
                { date: 4, month: 12, year: 2024 },
                { date: 5, month: 12, year: 2024 }
            ],
            nextReward: 200
        }
    },

    // 签到模拟数据
    signIn: {
        success: true,
        message: '签到成功',
        data: {
            creditsAdded: 200,
            consecutiveDays: 6,
            totalCredits: 1200
        }
    },

    // 用户项目列表模拟数据
    getUserProjects: {
        success: true,
        projects: [
            {
                id: 'mock_project_1',
                projectName: '示例项目1',
                description: '这是一个示例项目',
                versionsCount: 2,
                lastVersion: 'v1.1.0',
                updateTime: Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60, // 1天前的时间戳
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'mock_project_2',
                projectName: '示例项目2',
                description: '另一个示例项目',
                versionsCount: 1,
                lastVersion: 'v1.0.0',
                updateTime: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60, // 2天前的时间戳
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'mock_project_3',
                projectName: '个人博客网站',
                description: '使用Vue3构建的个人博客',
                versionsCount: 5,
                lastVersion: 'v2.3.1',
                updateTime: Math.floor(Date.now() / 1000) - 3 * 60 * 60, // 3小时前的时间戳
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            }
        ],
        total: 3
    },

    // 项目详情模拟数据
    getProjectById: {
        success: true,
        data: {
            project: {
                id: 'mock_project_1',
                projectName: '示例项目1',
                description: '这是一个示例项目',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                versions: [
                    {
                        id: 'v1.0.0',
                        version: '1.0.0',
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        description: '初始版本',
                        size: 1024 * 15, // 15KB
                        code: '<!DOCTYPE html>\n<html>\n<head><title>初始版本</title></head>\n<body><h1>Hello World</h1></body>\n</html>'
                    },
                    {
                        id: 'v1.1.0',
                        version: '1.1.0',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        description: '功能更新版本',
                        size: 1024 * 25, // 25KB
                        code: '<!DOCTYPE html>\n<html>\n<head><title>更新版本</title></head>\n<body><h1>Hello World v1.1</h1><p>新增功能</p></body>\n</html>'
                    }
                ]
            }
        }
    },

    // 项目版本代码模拟数据
    getProjectVersionCode: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例项目1</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .content {
            margin-top: 20px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎使用示例项目1</h1>
        <div class="content">
            <p>这是一个在预览模式下生成的示例项目。</p>
            <p>当预览模式开启时，所有API请求都会返回模拟数据。</p>
        </div>
    </div>
</body>
</html>`,

    // 更新项目模拟数据
    updateProject: {
        success: true,
        message: '项目更新成功',
        data: {
            id: 'mock_project_1',
            title: '更新后的项目',
            description: '项目已更新',
            updatedAt: new Date().toISOString()
        }
    },

    // 删除项目模拟数据
    deleteProject: {
        success: true,
        message: '项目删除成功'
    },

    // 模型积分消耗配置模拟数据
    getModelCreditCosts: {
        success: true,
        data: {
            'gpt-3.5-turbo': 1,
            'gpt-4': 3,
            'claude-3-sonnet': 2,
            'claude-3-opus': 5
        }
    }
};

// 模拟SSE流式数据
export const mockSSEData = {
    generateCode: [
        { type: 'message', data: { code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>示例页面</title>\n</head>\n<body>\n    <div class="container">\n        <h1>欢迎使用</h1>\n' } },
        { type: 'message', data: { code: '        <p>这是一个示例页面</p>\n        <div class="content">\n            <h2>功能特点</h2>\n            <ul>\n                <li>响应式设计</li>\n                <li>现代化界面</li>\n' } },
        { type: 'message', data: { code: '                <li>易于使用</li>\n            </ul>\n        </div>\n    </div>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 20px;\n' } },
        { type: 'message', data: { code: '            background-color: #f5f5f5;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            padding: 30px;\n            border-radius: 10px;\n' } },
        { type: 'message', data: { code: '            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        h1 {\n            color: #333;\n            text-align: center;\n        }\n        .content {\n            margin-top: 20px;\n' } },
        { type: 'message', data: { code: '        }\n        ul {\n            list-style-type: none;\n            padding: 0;\n        }\n        li {\n            padding: 10px;\n            background: #f9f9f9;\n            margin: 5px 0;\n            border-radius: 5px;\n        }\n    </style>\n</body>\n</html>' } },
        { type: 'complete', data: { projectId: 'mock_project_generated_123', versionId: 'v1.0.0', message: '代码生成完成' } }
    ],
    continueConversation: [
        { type: 'message', data: { code: '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>示例页面</title>\n</head>\n<body>\n    <div class="container">\n        <h1>欢迎使用</h1>\n' } },
        { type: 'message', data: { code: '        <p>这是一个示例页面</p>\n        <div class="content">\n            <h2>功能特点</h2>\n            <ul>\n                <li>响应式设计</li>\n                <li>现代化界面</li>\n' } },
        { type: 'message', data: { code: '                <li>易于使用</li>\n            </ul>\n        </div>\n        \n        <!-- 新增功能区域 -->\n        <div class="new-feature">\n            <h3>新增功能</h3>\n            <p>根据您的要求，我添加了以下功能：</p>\n' } },
        { type: 'message', data: { code: '            <div class="feature-list">\n                <div class="feature-item">\n                    <h4>交互效果</h4>\n                    <p>添加了鼠标悬停效果</p>\n                </div>\n                <div class="feature-item">\n                    <h4>动画效果</h4>\n                    <p>添加了平滑的过渡动画</p>\n                </div>\n            </div>\n        </div>\n    </div>\n    \n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 20px;\n' } },
        { type: 'message', data: { code: '            background-color: #f5f5f5;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background: white;\n            padding: 30px;\n            border-radius: 10px;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        h1 {\n            color: #333;\n            text-align: center;\n        }\n        .content {\n            margin-top: 20px;\n        }\n        ul {\n            list-style-type: none;\n            padding: 0;\n        }\n        li {\n            padding: 10px;\n            background: #f9f9f9;\n            margin: 5px 0;\n            border-radius: 5px;\n        }\n        \n        /* 新增功能样式 */\n        .new-feature {\n            margin-top: 30px;\n' } },
        { type: 'message', data: { code: '            padding: 20px;\n            background: #f0f8ff;\n            border-radius: 8px;\n            border-left: 4px solid #007aff;\n        }\n        .feature-item {\n            margin: 15px 0;\n        }\n        .feature-item h4 {\n            color: #007aff;\n            margin-bottom: 8px;\n        }\n        .feature-item:hover {\n            transform: translateX(5px);\n            transition: transform 0.3s ease;\n        }\n    </style>\n    \n    <script>\n        // 添加交互功能\n        document.addEventListener(\'DOMContentLoaded\', function() {\n            console.log(\'页面加载完成\');\n            \n            // 为功能项添加点击事件\n            const featureItems = document.querySelectorAll(\'.feature-item\');\n            featureItems.forEach(item => {\n                item.addEventListener(\'click\', function() {\n                    this.style.backgroundColor = \'#e3f2fd\';\n                    setTimeout(() => {\n                        this.style.backgroundColor = \'\';\n                    }, 300);\n                });\n            });\n        });\n    </script>\n</body>\n</html>' } },
        { type: 'complete', data: { projectId: 'mock_project_updated_456', versionId: 'v1.1.0', message: '对话继续完成' } }
    ]
};

// 模拟SSE流式响应
export const mockSSEResponse = (type, onData, onComplete, onError) => {
    const data = mockSSEData[type] || [];
    let index = 0;

    const sendNext = () => {
        if (index >= data.length) {
            return;
        }

        const item = data[index];
        setTimeout(() => {
            try {
                if (item.type === 'message' || item.type === 'data') {
                    onData(item.data);
                } else if (item.type === 'complete') {
                    onComplete(item.data);
                } else if (item.type === 'error') {
                    onError(item.data.error || '模拟错误');
                }
            } catch (error) {
                onError('模拟数据解析错误: ' + error.message);
            }
            
            index++;
            sendNext();
        }, 500 + Math.random() * 1000); // 模拟网络延迟
    };

    sendNext();
};
