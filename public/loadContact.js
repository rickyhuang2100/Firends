document.addEventListener('DOMContentLoaded', function() {
    fetch('contact.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('contact-container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading contact form:', error);
        });
});

let currentLoopId = null;
let video = null;
let shouldContinueLoop = false;

function parseTimeString(timeStr) {
    if (!timeStr) return 0;
    if (timeStr.includes(':')) {
        const [min, sec] = timeStr.split(':');
        return parseInt(min, 10) * 60 + parseFloat(sec);
    }
    return parseFloat(timeStr);
}

document.addEventListener('DOMContentLoaded', () => {
    video = document.getElementById('myVideo');
    if (!video) return;
    
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').replace('#','') === current) {
                link.classList.add('active');
            }
        });
    });
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('play-btn')) {
            var button = e.target;
            if (button.textContent === "⏹️") {
                shouldContinueLoop = false;
                if (currentLoopId !== null) {
                    cancelAnimationFrame(currentLoopId);
                    currentLoopId = null;
                }
                video.pause();
                button.textContent = "▶️";
                return;
            }
            
            // 停止所有現存的循環
            shouldContinueLoop = false;
            if (currentLoopId !== null) {
                cancelAnimationFrame(currentLoopId);
                currentLoopId = null;
            }
            
            // 重置所有按鈕
            document.querySelectorAll('.play-btn').forEach(btn => btn.textContent = '▶️');
            button.textContent = "⏹️";
            
            var startTime = parseTimeString(button.dataset.start);
            var endTime = parseTimeString(button.dataset.end);
            if (isNaN(startTime) || isNaN(endTime)) {
                console.log('data-start:', button.dataset.start, 'data-end:', button.dataset.end);
                return;
            }
            
            // 設置新的播放時間
            video.currentTime = startTime;
            video.play();
            
            // 啟動新的循環
            shouldContinueLoop = true;
            const runLoop = () => {
                if (!shouldContinueLoop) {
                    currentLoopId = null;
                    return;
                }
                
                // 檢查是否需要重置到開始位置
                if (!video.paused && video.currentTime >= endTime) {
                    video.currentTime = startTime;
                }
                
                currentLoopId = requestAnimationFrame(runLoop);
            };
            currentLoopId = requestAnimationFrame(runLoop);
        }
    });
    const menuButton = document.getElementById('menu-button');
    const nav = document.querySelector('header nav');
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuButton && nav) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('open');
            menuOverlay.style.display = nav.classList.contains('open') ? 'block' : 'none';
        });
        document.body.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && nav.classList.contains('open')) {
                if (!nav.contains(e.target) && e.target !== menuButton) {
                    nav.classList.remove('open');
                    menuOverlay.style.display = 'none';
                }
            }
        });
        menuOverlay.addEventListener('click', () => {
            nav.classList.remove('open');
            menuOverlay.style.display = 'none';
        });
    }
    const container = document.getElementById('video-button-container');
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    if (url && video) {
        video.src = url;
    } else if (video) {
        console.log("未在網址中找到 'url' 參數，使用預設影片或處理錯誤。");
    }
    if (url) {
        const btn = document.createElement('a');
        btn.href = url;
        btn.target = '_blank';
        btn.innerHTML = `<button class='text-lg font-bold bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded shadow'>▶️ 開始播放影片</button>`;
        container.appendChild(btn);
    } else {
        container.innerHTML = `<p class="text-red-500 text-3xl">找不到影片網址，請確認網址中包含 <code>?url=</code> 參數。</p>`;
    }
});