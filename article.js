document.addEventListener('DOMContentLoaded', () => {
    const articleContent = document.getElementById('article-content-target');

    // --- Step 1: Define the audio button HTML as a constant ---
    const audioButtonHTML = `
    <div class="article-meta">
        <button id="audio-pill" class="audio-pill" role="slider" aria-label="Audio Player" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="progress-fill"></div>
        <div class="content-wrapper">
            <div class="icon-wrapper"><svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg class="icon-pause" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></div>
            <span class="pill-text">Listen</span>
        </div>
        </button>
    </div>`;

    fetch('article.md')
    .then(response => {
        if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.text();
    })
    .then(markdownText => {
        // --- Step 2: Parse markdown and prepare for DOM manipulation ---
        const rawHTML = marked.parse(markdownText);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = rawHTML;

        // --- Step 3: Find the first heading and insert the button ---
        const firstHeading = tempContainer.querySelector('h1');
        if (firstHeading) {
        // Insert the button HTML string immediately after the h1 element
        firstHeading.insertAdjacentHTML('afterend', audioButtonHTML);
        } else {
        // Fallback: If no h1 is found, add the button at the very top
        tempContainer.insertAdjacentHTML('afterbegin', audioButtonHTML);
        }

        // --- Step 4: Inject the final, combined HTML into the page ---
        if (articleContent) {
        articleContent.innerHTML = tempContainer.innerHTML;
        }
        
        // --- Step 5: Initialize the audio player now that the button exists ---
        initializeAudioPlayer();
    })
    .catch(error => {
        console.error('Error fetching or rendering markdown:', error);
        if (articleContent) {
        articleContent.innerHTML = '<p style="color: #f88;">Error: Could not load article content.</p>';
        }
    });


    function initializeAudioPlayer() {
    // --- THIS AUDIO PLAYER LOGIC IS THE SAME AS BEFORE ---
    const audio = document.getElementById('article-audio');
    const pill = document.getElementById('audio-pill');
    const customCursor = document.querySelector('.cursor');
    if (!audio || !pill) return;

    const progressFill = pill.querySelector('.progress-fill');
    const pillText = pill.querySelector('.pill-text');
    let didMove = false;
    let wasPlayingBeforeDrag = false;
    let hasBeenActivated = false;
    let formattedDuration = '0:00';
    let isCurrentlyDragging = false;
    let originalPlayState = false;

    const formatTime = (seconds) => {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };
    const updateProgress = (percent) => {
        progressFill.style.width = `${percent}%`;
        pill.setAttribute('aria-valuenow', percent.toFixed(0));
    };
    const updateTimeDisplay = () => {
        if (hasBeenActivated) {
        pillText.textContent = `${formatTime(audio.currentTime)} / ${formattedDuration}`;
        }
    };
    const activatePlayer = () => {
        if (hasBeenActivated) return;
        hasBeenActivated = true;
        if (isFinite(audio.duration)) {
        formattedDuration = formatTime(audio.duration);
        }
        updateTimeDisplay();
    };
    audio.addEventListener('loadedmetadata', () => {
        formattedDuration = formatTime(audio.duration);
        if (hasBeenActivated) {
        updateTimeDisplay();
        }
    });
    audio.addEventListener('play', () => pill.classList.add('is-playing'));
    audio.addEventListener('pause', () => pill.classList.remove('is-playing'));
    audio.addEventListener('ended', () => {
        pill.classList.remove('is-playing');
        updateProgress(0);
        audio.currentTime = 0;
    });
    audio.addEventListener('timeupdate', () => {
        if (isCurrentlyDragging) return;
        if (isFinite(audio.duration) && audio.duration > 0) {
        const percent = (audio.currentTime / audio.duration) * 100;
        updateProgress(percent);
        if (hasBeenActivated) {
            updateTimeDisplay();
        }
        }
    });
    const handleDrag = (e) => {
        didMove = true;
        activatePlayer();
        if (!isFinite(audio.duration) || audio.duration <= 0) return;
        const rect = pill.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        let percent = (x / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));
        updateProgress(percent);
        const newTime = (percent / 100) * audio.duration;
        audio.currentTime = newTime;
        updateTimeDisplay();
    };
    const cleanupEventListeners = () => {
        window.removeEventListener('pointermove', handleDrag);
        window.removeEventListener('pointerup', stopDrag);
        window.removeEventListener('touchmove', handleDrag);
        window.removeEventListener('touchend', stopDrag);
    };
    const stopDrag = () => {
        isCurrentlyDragging = false;
        pill.classList.remove('is-dragging');
        if (customCursor) customCursor.classList.remove('cursor--grabbing');
        cleanupEventListeners();
        if (!didMove) { 
        activatePlayer();
        if (originalPlayState) {
            audio.pause();
        } else {
            audio.play().catch(console.error);
        }
        } else { 
        if (wasPlayingBeforeDrag) {
            audio.play().catch(console.error);
        }
        }
    };
    const startDrag = (e) => {
        e.preventDefault();
        didMove = false;
        isCurrentlyDragging = true;
        originalPlayState = !audio.paused;
        wasPlayingBeforeDrag = originalPlayState;
        if (wasPlayingBeforeDrag) {
        audio.pause();
        }
        pill.classList.add('is-dragging');
        if (customCursor) customCursor.classList.add('cursor--grabbing');
        cleanupEventListeners();
        window.addEventListener('pointermove', handleDrag, { passive: false });
        window.addEventListener('pointerup', stopDrag);
        window.addEventListener('touchmove', handleDrag, { passive: true });
        window.addEventListener('touchend', stopDrag);
    };
    pill.addEventListener('pointerdown', startDrag);
    pill.addEventListener('touchstart', startDrag, { passive: false });
    }
});