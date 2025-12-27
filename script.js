// 应用状态管理
const app = {
    media: [], // 改为media，支持视频和图片
    currentMedia: null, // 当前播放/显示的媒体
    favorites: [],
    likes: [],
    
    // 初始化应用
    init() {
        this.loadFromStorage();
        this.initEventListeners();
        this.renderMedia();
        this.loadSampleMedia();
    },
    
    // 从本地存储加载数据
    loadFromStorage() {
        const storedMedia = localStorage.getItem('media');
        const storedFavorites = localStorage.getItem('favorites');
        const storedLikes = localStorage.getItem('likes');
        
        if (storedMedia) {
            this.media = JSON.parse(storedMedia);
        }
        
        if (storedFavorites) {
            this.favorites = JSON.parse(storedFavorites);
        }
        
        if (storedLikes) {
            this.likes = JSON.parse(storedLikes);
        }
    },
    
    // 保存数据到本地存储
    saveToStorage() {
        localStorage.setItem('media', JSON.stringify(this.media));
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        localStorage.setItem('likes', JSON.stringify(this.likes));
    },
    
    // 初始化事件监听器
    initEventListeners() {
        // 导航链接
        document.getElementById('browse-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('browse-section');
        });
        
        document.getElementById('upload-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('upload-section');
        });
        
        document.getElementById('favorites-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('favorites-section');
            this.renderFavorites();
        });
        
        // 上传表单标签切换
        document.getElementById('video-tab').addEventListener('click', () => {
            this.switchUploadTab('video');
        });
        
        document.getElementById('image-tab').addEventListener('click', () => {
            this.switchUploadTab('image');
        });
        
        // 视频上传表单
        document.getElementById('video-upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVideoUpload();
        });
        
        // 图片上传表单
        document.getElementById('image-upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleImageUpload();
        });
        
        // 媒体操作按钮
        document.getElementById('like-btn').addEventListener('click', () => {
            this.toggleLike();
        });
        
        document.getElementById('favorite-btn').addEventListener('click', () => {
            this.toggleFavorite();
        });
        
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareMedia();
        });
        
        // 全屏按钮
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // 视频剪辑控制
        document.getElementById('apply-edit').addEventListener('click', () => {
            this.applyVideoEdit();
        });
        
        document.getElementById('reset-edit').addEventListener('click', () => {
            this.resetVideoEdit();
        });
    },
    
    // 切换上传标签
    switchUploadTab(tab) {
        const videoTab = document.getElementById('video-tab');
        const imageTab = document.getElementById('image-tab');
        const videoForm = document.getElementById('video-upload-form');
        const imageForm = document.getElementById('image-upload-form');
        
        if (tab === 'video') {
            videoTab.classList.add('active');
            imageTab.classList.remove('active');
            videoForm.classList.add('active');
            imageForm.classList.remove('active');
        } else {
            videoTab.classList.remove('active');
            imageTab.classList.add('active');
            videoForm.classList.remove('active');
            imageForm.classList.add('active');
        }
    },
    
    // 显示指定的页面部分
    showSection(sectionId) {
        // 隐藏所有部分
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 显示指定部分
        document.getElementById(sectionId).classList.add('active');
        
        // 更新导航链接状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 根据部分ID激活对应的导航链接
        if (sectionId === 'browse-section') {
            document.getElementById('browse-link').classList.add('active');
        } else if (sectionId === 'upload-section') {
            document.getElementById('upload-link').classList.add('active');
        } else if (sectionId === 'favorites-section') {
            document.getElementById('favorites-link').classList.add('active');
        }
    },
    
    // 加载示例媒体
    loadSampleMedia() {
        if (this.media.length === 0) {
            // 如果没有媒体，添加一些示例媒体
            const sampleMedia = [
                {
                    id: 'sample1',
                    type: 'video',
                    title: '美丽风景',
                    description: '这是一段展示自然美景的视频',
                    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                    thumbnail: 'https://picsum.photos/seed/video1/320/180.jpg',
                    likes: 0,
                    views: 0,
                    uploadDate: new Date().toISOString(),
                    startTime: 0,
                    endTime: null
                },
                {
                    id: 'sample2',
                    type: 'image',
                    title: '山川美景',
                    description: '这是一张美丽的山川风景照片',
                    url: 'https://picsum.photos/seed/image1/800/600.jpg',
                    thumbnail: 'https://picsum.photos/seed/image1/320/180.jpg',
                    likes: 0,
                    views: 0,
                    uploadDate: new Date().toISOString()
                },
                {
                    id: 'sample3',
                    type: 'video',
                    title: '城市夜景',
                    description: '繁华都市的夜晚景色',
                    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4',
                    thumbnail: 'https://picsum.photos/seed/video2/320/180.jpg',
                    likes: 0,
                    views: 0,
                    uploadDate: new Date().toISOString(),
                    startTime: 0,
                    endTime: null
                }
            ];
            
            this.media = sampleMedia;
            this.saveToStorage();
            this.renderMedia();
        }
    },
    
    // 处理视频上传
    handleVideoUpload() {
        const fileInput = document.getElementById('video-file');
        const titleInput = document.getElementById('video-title-upload');
        const descriptionInput = document.getElementById('video-description-upload');
        
        if (fileInput.files.length === 0) {
            alert('请选择一个视频文件');
            return;
        }
        
        const file = fileInput.files[0];
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (!title) {
            alert('请输入视频标题');
            return;
        }
        
        // 创建视频对象URL
        const videoURL = URL.createObjectURL(file);
        
        // 创建新视频对象
        const newVideo = {
            id: 'video_' + Date.now(),
            type: 'video',
            title: title,
            description: description,
            url: videoURL,
            thumbnail: 'https://picsum.photos/seed/' + Date.now() + '/320/180.jpg',
            likes: 0,
            views: 0,
            uploadDate: new Date().toISOString(),
            startTime: 0,
            endTime: null
        };
        
        // 添加到媒体列表
        this.media.unshift(newVideo);
        this.saveToStorage();
        
        // 重置表单
        fileInput.value = '';
        titleInput.value = '';
        descriptionInput.value = '';
        
        // 切换到浏览页面
        this.showSection('browse-section');
        this.renderMedia();
        
        // 显示成功消息
        this.showNotification('视频上传成功！');
    },
    
    // 处理图片上传
    handleImageUpload() {
        const fileInput = document.getElementById('image-file');
        const titleInput = document.getElementById('image-title-upload');
        const descriptionInput = document.getElementById('image-description-upload');
        
        if (fileInput.files.length === 0) {
            alert('请选择一个图片文件');
            return;
        }
        
        const file = fileInput.files[0];
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (!title) {
            alert('请输入图片标题');
            return;
        }
        
        // 创建图片对象URL
        const imageURL = URL.createObjectURL(file);
        
        // 创建新图片对象
        const newImage = {
            id: 'image_' + Date.now(),
            type: 'image',
            title: title,
            description: description,
            url: imageURL,
            thumbnail: imageURL, // 图片的缩略图就是原图
            likes: 0,
            views: 0,
            uploadDate: new Date().toISOString()
        };
        
        // 添加到媒体列表
        this.media.unshift(newImage);
        this.saveToStorage();
        
        // 重置表单
        fileInput.value = '';
        titleInput.value = '';
        descriptionInput.value = '';
        
        // 切换到浏览页面
        this.showSection('browse-section');
        this.renderMedia();
        
        // 显示成功消息
        this.showNotification('图片上传成功！');
    },
    
    // 渲染媒体列表
    renderMedia() {
        const container = document.getElementById('recommended-media');
        
        if (this.media.length === 0) {
            container.innerHTML = '<p class="empty-state">暂无内容，请先上传视频或图片</p>';
            return;
        }
        
        container.innerHTML = '';
        
        this.media.forEach(media => {
            const mediaElement = this.createMediaElement(media);
            container.appendChild(mediaElement);
        });
        
        // 如果没有当前媒体，设置第一个媒体为当前媒体
        if (!this.currentMedia && this.media.length > 0) {
            this.setCurrentMedia(this.media[0]);
        }
    },
    
    // 创建媒体元素
    createMediaElement(media) {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.dataset.mediaId = media.id;
        
        const typeBadge = media.type === 'video' ? '视频' : '图片';
        
        if (media.type === 'video') {
            div.innerHTML = `
                <div class="media-thumbnail">
                    <video src="${media.url}" muted></video>
                    <div class="media-type-badge">${typeBadge}</div>
                </div>
                <div class="media-details">
                    <h4>${media.title}</h4>
                    <p>${media.description}</p>
                    <div class="media-stats">
                        <span>👍 ${media.likes}</span>
                        <span>👁️ ${media.views}</span>
                    </div>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="media-thumbnail">
                    <img src="${media.url}" alt="${media.title}">
                    <div class="media-type-badge">${typeBadge}</div>
                </div>
                <div class="media-details">
                    <h4>${media.title}</h4>
                    <p>${media.description}</p>
                    <div class="media-stats">
                        <span>👍 ${media.likes}</span>
                        <span>👁️ ${media.views}</span>
                    </div>
                </div>
            `;
        }
        
        // 添加点击事件
        div.addEventListener('click', () => {
            this.setCurrentMedia(media);
        });
        
        return div;
    },
    
    // 设置当前播放/显示的媒体
    setCurrentMedia(media) {
        this.currentMedia = media;
        
        const mainVideo = document.getElementById('main-video');
        const mainImage = document.getElementById('main-image');
        const editControls = document.getElementById('video-edit-controls');
        
        // 根据媒体类型显示相应的内容
        if (media.type === 'video') {
            mainVideo.src = media.url;
            mainVideo.style.display = 'block';
            mainImage.style.display = 'none';
            editControls.style.display = 'block';
            
            // 设置视频剪辑控件的值
            document.getElementById('start-time').value = media.startTime || 0;
            
            // 获取视频时长来设置结束时间的默认值
            mainVideo.addEventListener('loadedmetadata', () => {
                if (media.endTime === null) {
                    document.getElementById('end-time').value = mainVideo.duration.toFixed(1);
                } else {
                    document.getElementById('end-time').value = media.endTime;
                }
            }, { once: true });
        } else {
            mainImage.src = media.url;
            mainVideo.style.display = 'none';
            mainImage.style.display = 'block';
            editControls.style.display = 'none';
        }
        
        // 更新媒体信息
        document.getElementById('media-title').textContent = media.title;
        document.getElementById('media-description').textContent = media.description;
        document.getElementById('like-count').textContent = media.likes;
        
        // 更新按钮状态
        const likeBtn = document.getElementById('like-btn');
        const favoriteBtn = document.getElementById('favorite-btn');
        
        // 检查是否已点赞
        if (this.likes.includes(media.id)) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
        
        // 检查是否已收藏
        if (this.favorites.includes(media.id)) {
            favoriteBtn.classList.add('favorited');
        } else {
            favoriteBtn.classList.remove('favorited');
        }
        
        // 增加观看次数
        media.views++;
        this.saveToStorage();
        this.renderMedia();
    },
    
    // 切换全屏模式
    toggleFullscreen() {
        const mediaPlayer = document.querySelector('.media-player');
        
        if (!document.fullscreenElement) {
            if (mediaPlayer.requestFullscreen) {
                mediaPlayer.requestFullscreen();
            } else if (mediaPlayer.webkitRequestFullscreen) { /* Safari */
                mediaPlayer.webkitRequestFullscreen();
            } else if (mediaPlayer.msRequestFullscreen) { /* IE11 */
                mediaPlayer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    },
    
    // 应用视频剪辑
    applyVideoEdit() {
        if (!this.currentMedia || this.currentMedia.type !== 'video') return;
        
        const startTime = parseFloat(document.getElementById('start-time').value);
        const endTime = parseFloat(document.getElementById('end-time').value);
        
        if (isNaN(startTime) || isNaN(endTime) || startTime < 0 || endTime <= startTime) {
            this.showNotification('请输入有效的时间范围');
            return;
        }
        
        // 保存剪辑时间
        this.currentMedia.startTime = startTime;
        this.currentMedia.endTime = endTime;
        
        // 应用剪辑到视频
        const mainVideo = document.getElementById('main-video');
        mainVideo.currentTime = startTime;
        
        // 设置视频播放范围
        mainVideo.addEventListener('timeupdate', () => {
            if (mainVideo.currentTime >= endTime) {
                mainVideo.pause();
                mainVideo.currentTime = startTime;
            }
        });
        
        this.saveToStorage();
        this.showNotification('视频剪辑已应用');
    },
    
    // 重置视频剪辑
    resetVideoEdit() {
        if (!this.currentMedia || this.currentMedia.type !== 'video') return;
        
        // 重置剪辑时间
        this.currentMedia.startTime = 0;
        this.currentMedia.endTime = null;
        
        // 重置视频
        const mainVideo = document.getElementById('main-video');
        mainVideo.currentTime = 0;
        
        // 移除之前的事件监听器
        const newVideo = mainVideo.cloneNode(true);
        mainVideo.parentNode.replaceChild(newVideo, mainVideo);
        
        // 更新表单
        document.getElementById('start-time').value = 0;
        
        this.saveToStorage();
        this.showNotification('视频剪辑已重置');
    },
    
    // 切换点赞状态
    toggleLike() {
        if (!this.currentMedia) return;
        
        const mediaId = this.currentMedia.id;
        const likeBtn = document.getElementById('like-btn');
        
        if (this.likes.includes(mediaId)) {
            // 取消点赞
            this.likes = this.likes.filter(id => id !== mediaId);
            this.currentMedia.likes--;
            likeBtn.classList.remove('liked');
        } else {
            // 点赞
            this.likes.push(mediaId);
            this.currentMedia.likes++;
            likeBtn.classList.add('liked');
        }
        
        // 更新点赞数显示
        document.getElementById('like-count').textContent = this.currentMedia.likes;
        
        // 保存到本地存储
        this.saveToStorage();
        this.renderMedia();
    },
    
    // 切换收藏状态
    toggleFavorite() {
        if (!this.currentMedia) return;
        
        const mediaId = this.currentMedia.id;
        const favoriteBtn = document.getElementById('favorite-btn');
        
        if (this.favorites.includes(mediaId)) {
            // 取消收藏
            this.favorites = this.favorites.filter(id => id !== mediaId);
            favoriteBtn.classList.remove('favorited');
            this.showNotification('已取消收藏');
        } else {
            // 收藏
            this.favorites.push(mediaId);
            favoriteBtn.classList.add('favorited');
            this.showNotification('已添加到收藏');
        }
        
        // 保存到本地存储
        this.saveToStorage();
    },
    
    // 分享媒体
    shareMedia() {
        if (!this.currentMedia) return;
        
        // 创建分享链接
        const shareUrl = window.location.href + '#media=' + this.currentMedia.id;
        
        // 尝试使用Web Share API
        if (navigator.share) {
            navigator.share({
                title: this.currentMedia.title,
                text: this.currentMedia.description,
                url: shareUrl
            }).catch(err => {
                console.log('分享失败:', err);
                this.copyToClipboard(shareUrl);
            });
        } else {
            // 如果不支持Web Share API，复制链接到剪贴板
            this.copyToClipboard(shareUrl);
        }
    },
    
    // 复制到剪贴板
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showNotification('链接已复制到剪贴板');
    },
    
    // 渲染收藏的媒体
    renderFavorites() {
        const container = document.getElementById('favorite-media');
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>您还没有收藏任何内容</h3>
                    <p>浏览视频或图片并点击收藏按钮来添加收藏</p>
                    <a href="#" id="browse-from-favorites">去浏览内容</a>
                </div>
            `;
            
            // 添加从收藏页面跳转到浏览页面的链接
            document.getElementById('browse-from-favorites').addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('browse-section');
            });
            
            return;
        }
        
        container.innerHTML = '';
        
        // 获取收藏的媒体
        const favoriteMedia = this.media.filter(media => 
            this.favorites.includes(media.id)
        );
        
        favoriteMedia.forEach(media => {
            const mediaElement = this.createMediaElement(media);
            container.appendChild(mediaElement);
        });
    },
    
    // 显示通知消息
    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});