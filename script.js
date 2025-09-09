// 使用localStorage模拟数据存储
const users = JSON.parse(localStorage.getItem('blogUsers')) || [];
const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];

// DOM元素
const authContainer = document.getElementById('auth-container');
const blogContent = document.getElementById('blog-content');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authButton = document.getElementById('auth-button');
const authToggle = document.getElementById('auth-toggle');
const authToggleLink = document.getElementById('auth-toggle-link');
const confirmPasswordGroup = document.getElementById('confirm-password-group');
const postForm = document.getElementById('post-form');
const postsContainer = document.getElementById('posts-container');
const logoutLink = document.getElementById('logout-link');
const homeLink = document.getElementById('home-link');

let isLogin = true;
let currentUser = null;

// 初始化
function init() {
    // 检查是否已登录
    const loggedInUser = localStorage.getItem('blogCurrentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showBlogContent();
    }
    
    renderPosts();
}

// 切换登录/注册表单
authToggleLink.addEventListener('click', function() {
    isLogin = !isLogin;
    if (isLogin) {
        authTitle.textContent = '登录';
        authButton.textContent = '登录';
        authToggle.innerHTML = '没有账号？<a id="auth-toggle-link">注册</a>';
        confirmPasswordGroup.style.display = 'none';
    } else {
        authTitle.textContent = '注册';
        authButton.textContent = '注册';
        authToggle.innerHTML = '已有账号？<a id="auth-toggle-link">登录</a>';
        confirmPasswordGroup.style.display = 'block';
    }
});

// 处理认证表单提交
authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (isLogin) {
        // 登录逻辑
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('blogCurrentUser', JSON.stringify(user));
            showBlogContent();
        } else {
            alert('用户名或密码错误！');
        }
    } else {
        // 注册逻辑
        const confirmPassword = document.getElementById('confirm-password').value;
        if (password !== confirmPassword) {
            alert('密码不匹配！');
            return;
        }
        
        if (users.some(u => u.username === username)) {
            alert('用户名已存在！');
            return;
        }
        
        const newUser = { username, password };
        users.push(newUser);
        localStorage.setItem('blogUsers', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('blogCurrentUser', JSON.stringify(newUser));
        
        alert('注册成功！');
        showBlogContent();
    }
});

// 处理帖子发布
postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    
    const newPost = {
        id: Date.now(),
        title,
        content,
        author: currentUser.username,
        date: new Date().toLocaleString(),
        comments: []
    };
    
    posts.unshift(newPost);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    renderPosts();
    postForm.reset();
});

// 显示博客内容
function showBlogContent() {
    authContainer.style.display = 'none';
    blogContent.style.display = 'block';
    logoutLink.style.display = 'block';
}

// 渲染帖子列表
function renderPosts() {
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>暂无帖子，成为第一个发布的人吧！</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-meta">作者: ${post.author} | 发布时间: ${post.date}</div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            <div class="comments-section">
                <h4>评论 (${post.comments.length})</h4>
                <div class="comments-list" id="comments-${post.id}">
                    ${renderComments(post.comments)}
                </div>
                <div class="comment-form">
                    <div class="form-group">
                        <textarea placeholder="写下你的评论..." id="comment-content-${post.id}"></textarea>
                    </div>
                    <button onclick="addComment(${post.id})">提交评论</button>
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

// 渲染评论
function renderComments(comments) {
    if (comments.length === 0) {
        return '<p>暂无评论</p>';
    }
    
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span>${comment.author}</span>
                <span>${comment.date}</span>
            </div>
            <p>${comment.content}</p>
        </div>
    `).join('');
}

// 添加评论
function addComment(postId) {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const commentContent = document.getElementById(`comment-content-${postId}`).value;
    if (!commentContent) {
        alert('评论内容不能为空！');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            author: currentUser.username,
            content: commentContent,
            date: new Date().toLocaleString()
        });
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        document.getElementById(`comment-content-${postId}`).value = '';
        
        // 更新评论列表
        document.getElementById(`comments-${postId}`).innerHTML = renderComments(post.comments);
    }
}

// 退出登录
logoutLink.addEventListener('click', function() {
    currentUser = null;
    localStorage.removeItem('blogCurrentUser');
    authContainer.style.display = 'block';
    blogContent.style.display = 'none';
    logoutLink.style.display = 'none';
    authForm.reset();
});

// 首页链接
homeLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (currentUser) {
        showBlogContent();
    }
});

// 初始化应用
init();