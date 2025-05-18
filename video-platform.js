// video-platform.js


const videoPlatform = {
  videos: [],
  comments: [],
  currentUser: null,
  categories: ['Все', 'Музыка', 'Игры', 'Фильмы', 'Новости', 'Спорт', 'Обучение', 'Наука', 'Кулинария', 'Путешествия'],
  currentVideoDuration: '0:00',
  
  // Инициализация приложения
  init() {
    this.cacheDomElements();
    this.bindEvents();
    this.checkAuth();
    this.renderVideos();
    this.generateSampleData();
    this.initFileUploaders();
    
    // Проверяем, был ли пользователь перенаправлен после авторизации
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('auth_success')) {
        this.checkAuth(); // Обновляем статус авторизации
    }
},


  // Инициализация загрузчиков файлов
  initFileUploaders() {
    if (!this.dom.thumbnailUpload || !this.dom.videoUpload) return;
    
    this.dom.thumbnailUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.previewThumbnail(file);
    });
    
    this.dom.videoUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.previewVideo(file);
    });
  },
  
  // Превью загруженного изображения
  previewThumbnail(file) {
    if (!file.type.match('image.*')) {
      alert('Пожалуйста, выберите файл изображения (JPEG, PNG)');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер превью не должен превышать 2MB');
      this.dom.thumbnailUpload.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.dom.thumbnailPreview.src = e.target.result;
      this.dom.thumbnailPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  },
  
  // Превью загруженного видео
  previewVideo(file) {
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validVideoTypes.includes(file.type)) {
      alert('Пожалуйста, выберите видеофайл (MP4, WebM или Ogg)');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert('Размер видео не должен превышать 50MB');
      this.dom.videoUpload.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.dom.videoPreview.src = e.target.result;
      this.dom.videoPreview.style.display = 'block';
      
      const tempVideo = document.createElement('video');
      tempVideo.src = e.target.result;
      tempVideo.onloadedmetadata = () => {
        this.currentVideoDuration = this.formatDuration(tempVideo.duration);
        this.dom.videoDuration.textContent = `Длительность: ${this.currentVideoDuration}`;
        this.dom.videoDuration.style.display = 'block';
      };
    };
    reader.readAsDataURL(file);
  },
  
  // Форматирование длительности видео
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },
  
  // Кэширование DOM элементов
  cacheDomElements() {
    this.dom = {
      videoGrid: document.getElementById('videoGrid'),
      uploadModal: document.getElementById('uploadModal'),
      uploadForm: document.getElementById('uploadForm'),
      openUploadModalBtn: document.getElementById('openUploadModal'),
      cancelUploadBtn: document.getElementById('cancelUpload'),
      filterBtns: document.querySelectorAll('.filter-btn'),
      authBtn: document.querySelector('.auth-btn'),
      searchInput: document.querySelector('.search-input'),
      videoPlayerModal: document.getElementById('videoPlayerModal'),
      videoPlayer: document.getElementById('videoPlayer'),
      videoPlayerTitle: document.getElementById('videoPlayerTitle'),
      videoPlayerDescription: document.getElementById('videoPlayerDescription'),
      videoPlayerStats: document.getElementById('videoPlayerStats'),
      videoPlayerLikes: document.getElementById('videoPlayerLikes'),
      likeBtn: document.getElementById('likeBtn'),
      commentForm: document.getElementById('commentForm'),
      commentInput: document.getElementById('commentInput'),
      commentsContainer: document.getElementById('commentsContainer'),
      closePlayerBtn: document.getElementById('closePlayerBtn'),
      thumbnailUpload: document.getElementById('thumbnailUpload'),
      videoUpload: document.getElementById('videoUpload'),
      thumbnailPreview: document.getElementById('thumbnailPreview'),
      videoPreview: document.getElementById('videoPreview'),
      videoDuration: document.getElementById('videoDuration'),
      videoTitle: document.getElementById('videoTitle'),
      videoDescription: document.getElementById('videoDescription'),
      videoChannel: document.getElementById('videoChannel'),
      videoCategory: document.getElementById('videoCategory')
    };

    
    if (!this.dom.videoPlayerModal) {
      this.createVideoPlayerModal();
    }
    
    if (this.dom.uploadForm && !document.getElementById('thumbnailUpload')) {
      this.createFileUploadElements();
    }
  },
  
  // Создание элементов для загрузки файлов
  createFileUploadElements() {
    const uploadForm = this.dom.uploadForm;
    
    const oldThumbnailInput = document.getElementById('videoThumbnail');
    const oldVideoInput = document.getElementById('videoFile');
    if (oldThumbnailInput) oldThumbnailInput.remove();
    if (oldVideoInput) oldVideoInput.remove();
    
    const thumbnailUploadHtml = `
      <div class="form-group">
        <label for="thumbnailUpload" class="form-label">Превью (загрузить с устройства, до 2MB)</label>
        <input type="file" id="thumbnailUpload" class="form-input" accept="image/jpeg, image/png" required>
        <img id="thumbnailPreview" style="max-width: 100%; margin-top: 10px; display: none;">
      </div>
    `;
    
    const videoUploadHtml = `
      <div class="form-group">
        <label for="videoUpload" class="form-label">Видеофайл (загрузить с устройства, до 50MB)</label>
        <input type="file" id="videoUpload" class="form-input" accept="video/mp4, video/webm, video/ogg" required>
        <video id="videoPreview" controls style="max-width: 100%; margin-top: 10px; display: none;"></video>
        <div id="videoDuration" style="display: none; margin-top: 5px;"></div>
      </div>
    `;
    
    const formActions = uploadForm.querySelector('.form-actions') || uploadForm;
    uploadForm.insertBefore(this.htmlToElement(thumbnailUploadHtml), formActions);
    uploadForm.insertBefore(this.htmlToElement(videoUploadHtml), formActions);
    
    this.cacheDomElements();
  },
  
  htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  },
  
  // Создание модального окна для просмотра видео
  createVideoPlayerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'videoPlayerModal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <div class="video-player-container">
          <video controls id="videoPlayer" style="width: 100%;"></video>
          <div class="video-info" style="margin-top: 15px;">
            <h3 id="videoPlayerTitle"></h3>
            <div class="video-stats" id="videoPlayerStats">
              <span id="videoPlayerViews"></span>
              <span id="videoPlayerLikes" style="margin-left: 15px;"></span>
              <button id="likeBtn" style="margin-left: 15px; background: none; border: none; cursor: pointer;">
                <i class="far fa-thumbs-up"></i>
              </button>
            </div>
            <div class="channel-info" style="display: flex; align-items: center; margin: 10px 0;">
              <div class="channel-avatar" style="width: 40px; height: 40px; background-color: #ddd; border-radius: 50%;"></div>
              <span class="channel-name" style="margin-left: 10px;"></span>
            </div>
            <div class="video-description" id="videoPlayerDescription" style="background: #f5f5f5; padding: 10px; border-radius: 4px;"></div>
          </div>
          
          <div class="comments-section" style="margin-top: 20px;">
            <h4>Комментарии</h4>
            <form id="commentForm" style="margin-bottom: 20px;">
              <textarea id="commentInput" placeholder="Добавьте комментарий..." style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ddd;"></textarea>
              <button type="submit" style="margin-top: 10px; padding: 8px 15px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">Отправить</button>
            </form>
            <div id="commentsContainer"></div>
          </div>
        </div>
        <button id="closePlayerBtn" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
      </div>
    `;
    document.body.appendChild(modal);
    
    this.cacheDomElements();
    
    this.dom.closePlayerBtn.addEventListener('click', () => {
      this.toggleModal(this.dom.videoPlayerModal);
    });
  },
  
  // Привязка событий
  bindEvents() {
    this.dom.openUploadModalBtn?.addEventListener('click', () => {
      this.resetUploadForm();
      this.toggleModal(this.dom.uploadModal);
    });
    
    this.dom.cancelUploadBtn?.addEventListener('click', () => {
      this.resetUploadForm();
      this.toggleModal(this.dom.uploadModal);
    });
    
    this.dom.uploadForm?.addEventListener('submit', (e) => this.handleVideoUpload(e));
    
    this.dom.filterBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.textContent === 'Все' ? null : btn.textContent;
        this.renderVideos(category);
      });
    });
    
    this.dom.searchInput?.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      this.searchVideos(searchTerm);
    });
    
    this.dom.authBtn?.addEventListener('click', () => this.handleAuth());
    
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.toggleModal(e.target);
      }
    });
  },
  
  // Сброс формы загрузки
  resetUploadForm() {
    if (this.dom.uploadForm) {
      this.dom.uploadForm.reset();
      this.dom.thumbnailPreview.style.display = 'none';
      this.dom.videoPreview.style.display = 'none';
      this.dom.videoDuration.style.display = 'none';
      this.currentVideoDuration = '0:00';
    }
  },
  
  // Обработка загрузки видео
  handleVideoUpload(e) {
    e.preventDefault();
    
    if (!this.currentUser) {
      alert('Пожалуйста, войдите в систему, чтобы загружать видео');
      return;
    }
    
    const title = this.dom.videoTitle.value;
    const description = this.dom.videoDescription.value;
    const channel = this.dom.videoChannel.value || this.currentUser.name;
    const category = this.dom.videoCategory.value;
    
    if (!this.dom.thumbnailUpload.files[0] || !this.dom.videoUpload.files[0]) {
      alert('Пожалуйста, выберите файлы превью и видео');
      return;
    }
    
    const thumbnailUrl = URL.createObjectURL(this.dom.thumbnailUpload.files[0]);
    const videoUrl = URL.createObjectURL(this.dom.videoUpload.files[0]);
    
    const newVideo = {
      id: Date.now(),
      title,
      description,
      thumbnail: thumbnailUrl,
      videoUrl: videoUrl,
      channel,
      category,
      views: 0,
      likes: 0,
      likedBy: [],
      duration: this.currentVideoDuration || this.generateRandomDuration(),
      uploadDate: 'Только что',
      uploaderId: this.currentUser.id
    };
    
    this.videos.unshift(newVideo);
    this.renderVideos();
    this.toggleModal(this.dom.uploadModal);
    this.resetUploadForm();
    this.saveToLocalStorage();
  },
  
  generateRandomDuration() {
    const minutes = Math.floor(Math.random() * 20) + 1;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },
  
  // Отображение видео
  renderVideos(filterCategory = null) {
    this.dom.videoGrid.innerHTML = '';
    
    const filteredVideos = filterCategory 
      ? this.videos.filter(video => video.category === filterCategory)
      : this.videos;
    
    if (filteredVideos.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = filterCategory 
        ? `Нет видео в категории "${filterCategory}"`
        : 'Нет загруженных видео. Нажмите "Загрузить", чтобы добавить первое видео.';
      this.dom.videoGrid.appendChild(emptyMessage);
      return;
    }
    
    filteredVideos.forEach(video => {
      const videoCard = document.createElement('div');
      videoCard.className = 'video-card';
      videoCard.innerHTML = `
        <div class="video-thumbnail">
          <img src="${video.thumbnail}" alt="${video.title}">
          <span class="video-duration">${video.duration}</span>
        </div>
        <div class="video-info">
          <h3 class="video-title">${video.title}</h3>
          <div class="video-channel">
            <div class="channel-avatar" style="width: 24px; height: 24px; background-color: #ddd; border-radius: 50%;"></div>
            <span class="channel-name">${video.channel}</span>
          </div>
          <div class="video-stats">
            <span class="video-views">${this.formatViews(video.views)} просмотров</span>
            <span class="video-date">${video.uploadDate}</span>
          </div>
        </div>
      `;
      
      videoCard.addEventListener('click', () => this.openVideoPlayer(video));
      this.dom.videoGrid.appendChild(videoCard);
    });
  },
  
  // Открытие плеера с видео
  openVideoPlayer(video) {
    video.views++;
    this.saveToLocalStorage();
    
    // Очищаем предыдущий источник видео
    this.dom.videoPlayer.src = '';
    // Устанавливаем новый источник
    this.dom.videoPlayer.src = video.videoUrl;
    
    // Устанавливаем тип видео для корректного воспроизведения
    const fileExtension = video.videoUrl.split('.').pop().toLowerCase();
    if (fileExtension === 'mp4') {
      this.dom.videoPlayer.type = 'video/mp4';
    } else if (fileExtension === 'webm') {
      this.dom.videoPlayer.type = 'video/webm';
    } else if (fileExtension === 'ogg') {
      this.dom.videoPlayer.type = 'video/ogg';
    }
    
    this.dom.videoPlayer.load(); // Перезагружаем видео
    
    this.dom.videoPlayerTitle.textContent = video.title;
    this.dom.videoPlayerDescription.textContent = video.description;
    document.querySelector('.channel-name').textContent = video.channel;
    
    const viewsElement = document.getElementById('videoPlayerViews');
    if (viewsElement) {
      viewsElement.textContent = `${this.formatViews(video.views)} просмотров`;
    }
    
    this.dom.videoPlayerLikes.textContent = `${this.formatViews(video.likes)} лайков`;
    
    const isLiked = this.currentUser && video.likedBy.includes(this.currentUser.id);
    this.dom.likeBtn.innerHTML = isLiked 
      ? '<i class="fas fa-thumbs-up"></i>' 
      : '<i class="far fa-thumbs-up"></i>';
    
    this.dom.commentsContainer.innerHTML = '';
    
    const videoComments = this.comments.filter(comment => comment.videoId === video.id);
    if (videoComments.length > 0) {
      videoComments.forEach(comment => this.renderComment(comment));
    } else {
      this.dom.commentsContainer.innerHTML = '<p>Пока нет комментариев. Будьте первым!</p>';
    }
    
    this.dom.likeBtn.onclick = () => this.handleLike(video);
    this.dom.commentForm.onsubmit = (e) => this.handleCommentSubmit(e, video.id);
    
    this.toggleModal(this.dom.videoPlayerModal);
    
    // Включаем звук по умолчанию
    this.dom.videoPlayer.muted = false;
    this.dom.videoPlayer.volume = 0.7;
    
    // Пытаемся запустить воспроизведение
    const playPromise = this.dom.videoPlayer.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log('Автовоспроизведение не сработало, показываем кнопку воспроизведения');
        this.dom.videoPlayer.controls = true;
      });
    }
  },
  
  // Обработка лайков
  handleLike(video) {
    if (!this.currentUser) {
      alert('Пожалуйста, войдите в систему, чтобы ставить лайки');
      return;
    }
    
    const userId = this.currentUser.id;
    const likeIndex = video.likedBy.indexOf(userId);
    
    if (likeIndex === -1) {
      video.likedBy.push(userId);
      video.likes++;
      this.dom.likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    } else {
      video.likedBy.splice(likeIndex, 1);
      video.likes--;
      this.dom.likeBtn.innerHTML = '<i class="far fa-thumbs-up"></i>';
    }
    
    this.dom.videoPlayerLikes.textContent = `${this.formatViews(video.likes)} лайков`;
    this.saveToLocalStorage();
  },
  
  // Обработка комментариев
  handleCommentSubmit(e, videoId) {
    e.preventDefault();
    
    if (!this.currentUser) {
      alert('Пожалуйста, войдите в систему, чтобы оставлять комментарии');
      return;
    }
    
    const commentText = this.dom.commentInput.value.trim();
    if (!commentText) return;
    
    const newComment = {
      id: Date.now(),
      videoId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      text: commentText,
      date: new Date().toLocaleString()
    };
    
    this.comments.unshift(newComment);
    this.renderComment(newComment);
    this.dom.commentInput.value = '';
    this.saveToLocalStorage();
  },
  
  // Отображение комментария
  renderComment(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.style.marginBottom = '15px';
    commentElement.style.paddingBottom = '15px';
    commentElement.style.borderBottom = '1px solid #eee';
    commentElement.innerHTML = `
      <div style="display: flex; margin-bottom: 5px;">
        <div class="channel-avatar" style="width: 32px; height: 32px; background-color: #ddd; border-radius: 50%; margin-right: 10px;"></div>
        <div>
          <strong>${comment.userName}</strong>
          <div style="color: #666; font-size: 12px;">${comment.date}</div>
        </div>
      </div>
      <div>${comment.text}</div>
    `;
    
    if (this.dom.commentsContainer.firstChild) {
      this.dom.commentsContainer.insertBefore(commentElement, this.dom.commentsContainer.firstChild);
    } else {
      this.dom.commentsContainer.appendChild(commentElement);
    }
  },
  
  // Поиск видео
  searchVideos(searchTerm) {
    if (!searchTerm) {
      this.renderVideos();
      return;
    }
    
    const filteredVideos = this.videos.filter(video => 
      video.title.toLowerCase().includes(searchTerm) || 
      video.description.toLowerCase().includes(searchTerm) ||
      video.channel.toLowerCase().includes(searchTerm)
    );
    
    this.dom.videoGrid.innerHTML = '';
    
    if (filteredVideos.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'Ничего не найдено';
      this.dom.videoGrid.appendChild(emptyMessage);
      return;
    }
    
    filteredVideos.forEach(video => {
      const videoCard = document.createElement('div');
      videoCard.className = 'video-card';
      videoCard.innerHTML = `
        <div class="video-thumbnail">
          <img src="${video.thumbnail}" alt="${video.title}">
          <span class="video-duration">${video.duration}</span>
        </div>
        <div class="video-info">
          <h3 class="video-title">${video.title}</h3>
          <div class="video-channel">
            <div class="channel-avatar" style="width: 24px; height: 24px; background-color: #ddd; border-radius: 50%;"></div>
            <span class="channel-name">${video.channel}</span>
          </div>
          <div class="video-stats">
            <span class="video-views">${this.formatViews(video.views)} просмотров</span>
            <span class="video-date">${video.uploadDate}</span>
          </div>
        </div>
      `;
      
      videoCard.addEventListener('click', () => this.openVideoPlayer(video));
      this.dom.videoGrid.appendChild(videoCard);
    });
  },
  
  // Управление модальными окнами
  toggleModal(modal) {
    if (modal.style.display === 'flex') {
      modal.style.display = 'none';
      this.dom.videoPlayer.pause();
    } else {
      modal.style.display = 'flex';
    }
  },
  
  // Форматирование числа просмотров/лайков
  formatViews(views) {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views;
  },
  
  // Авторизация
  handleAuth() {
    if (this.currentUser) {
        this.handleLogout();
    } else {
        // Перенаправляем на страницу регистрации с параметром return
        window.location.href = 'registration.html?return=' + encodeURIComponent(window.location.href);
    }
},
  
  // Проверка авторизации при загрузке
  checkAuth() {
    const userData = localStorage.getItem('videoPlatformUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.dom.authBtn.textContent = 'Выйти';
    }
  },
  
  // Генерация тестовых данных
  generateSampleData() {
    if (this.videos.length > 0) return;
    
    const sampleVideos = [
      {
        id: 1,
        title: 'Как приготовить идеальный стейк',
        description: 'В этом видео я покажу, как приготовить идеальный стейк дома. Простые шаги и советы для идеального результата!',
        thumbnail: 'https://i.ytimg.com/vi/AmC9SmCBUj4/maxresdefault.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        channel: 'Кулинарные шедевры',
        category: 'Кулинария',
        views: 1250000,
        likes: 87000,
        likedBy: [],
        duration: '12:45',
        uploadDate: '2 недели назад',
        uploaderId: 101
      },
      {
        id: 2,
        title: 'Топ 10 мест для посещения в Японии',
        description: 'Путешествие по Японии: самые красивые и интересные места, которые стоит посетить.',
        thumbnail: 'https://i.ytimg.com/vi/2V-2ABkUREE/maxresdefault.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        channel: 'Мир путешествий',
        category: 'Путешествия',
        views: 890000,
        likes: 45000,
        likedBy: [],
        duration: '15:30',
        uploadDate: '3 недели назад',
        uploaderId: 102
      },
      {
        id: 3,
        title: 'Изучаем JavaScript за 1 час',
        description: 'Быстрый курс по основам JavaScript для начинающих программистов.',
        thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        channel: 'Программирование для всех',
        category: 'Обучение',
        views: 3200000,
        likes: 145000,
        likedBy: [],
        duration: '1:05:22',
        uploadDate: '1 месяц назад',
        uploaderId: 103
      }
    ];
    
    const sampleComments = [
      {
        id: 1,
        videoId: 1,
        userId: 101,
        userName: 'Кулинарный критик',
        text: 'Отличный рецепт! Попробовал - получилось просто великолепно.',
        date: '5 дней назад'
      },
      {
        id: 2,
        videoId: 1,
        userId: 102,
        userName: 'Начинающий повар',
        text: 'Спасибо за подробное объяснение, очень помогло!',
        date: '3 дня назад'
      },
      {
        id: 3,
        videoId: 2,
        userId: 103,
        userName: 'Путешественник',
        text: 'Был в этих местах - действительно потрясающе!',
        date: '1 неделя назад'
      }
    ];
    
    this.videos = sampleVideos;
    this.comments = sampleComments;
    
    this.loadFromLocalStorage();
  },
  
  // Сохранение данных в localStorage
  saveToLocalStorage() {
    localStorage.setItem('videoPlatformVideos', JSON.stringify(this.videos));
    localStorage.setItem('videoPlatformComments', JSON.stringify(this.comments));
    if (this.currentUser) {
      localStorage.setItem('videoPlatformUser', JSON.stringify(this.currentUser));
    }
  },
  
  // Загрузка данных из localStorage
  loadFromLocalStorage() {
    const savedVideos = localStorage.getItem('videoPlatformVideos');
    const savedComments = localStorage.getItem('videoPlatformComments');
    
    if (savedVideos) this.videos = JSON.parse(savedVideos);
    if (savedComments) this.comments = JSON.parse(savedComments);
  }
};

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  videoPlatform.init();
});