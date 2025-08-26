document.addEventListener('DOMContentLoaded', () => {
    const articleContent = document.getElementById('article-content-target');

    // --- Step 1: Define the audio button HTML as a constant ---
    const audioButtonHTML = `
    <div class="article-meta">
        <button id="audio-pill" class="audio-pill" role="slider" aria-label="Audio Player" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="progress-fill"></div>
        <div class="content-wrapper">
            <div class="icon-wrapper"><svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg class="icon-pause" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></div>
            <div class="loader"></div> <!-- NEW: Spinner element -->
            <span class="pill-text">Listen</span>
        </div>
        </button>
    </div>`;

    fetch('./article.md')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.text();
    })
    .then(rawText => {
        // --- Step 2: Parse front matter and separate content ---
        const frontMatterRegex = /^---\s*([\s\S]*?)\s*---\s*/;
        const match = rawText.match(frontMatterRegex);
        
        let description = '';
        const markdownContent = match ? rawText.replace(frontMatterRegex, '').trim() : rawText;

        if (match) {
            const frontMatter = match[1];
            const descMatch = frontMatter.match(/^description:\s*(.*)$/m);
            if (descMatch) {
                description = descMatch[1].trim();
            }
        }

        // --- Step 3: Parse markdown and prepare for DOM manipulation ---
        const rawHTML = marked.parse(markdownContent);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = rawHTML;

        // --- Step 4: Restructure the header for the inline layout ---
        const firstHeading = tempContainer.querySelector('h1');
        if (firstHeading) {
            // 1. Create the new flex wrapper element
            const headerWrapper = document.createElement('div');
            headerWrapper.className = 'article-header';

            // 2. Insert the new wrapper into the DOM, right before the original h1
            firstHeading.parentNode.insertBefore(headerWrapper, firstHeading);
            
            // 3. Move the h1 *inside* the new wrapper
            headerWrapper.appendChild(firstHeading);
            
            // 4. Add the audio button HTML to the end of the wrapper
            headerWrapper.insertAdjacentHTML('beforeend', audioButtonHTML);

            // 5. Create and insert the subtitle (if it exists) *after* the entire header wrapper
            if (description) {
                const subtitleHTML = `<p class="article-subtitle">${description}</p>`;
                headerWrapper.insertAdjacentHTML('afterend', subtitleHTML);
            }
        } else {
            // Fallback: If no h1 is found, add the button at the very top
            tempContainer.insertAdjacentHTML('afterbegin', audioButtonHTML);
        }

        // --- Step 5: Inject the final, combined HTML into the page ---
        if (articleContent) {
            articleContent.innerHTML = tempContainer.innerHTML;
        }
        
        // --- Step 6: Apply syntax highlighting to the new code blocks ---
        hljs.highlightAll();
        
        // --- Step 7: Initialize the audio player now that the button exists ---
        initializeAudioPlayer();

        // --- Step 8: Initialize the scroll progress bar ---
        initializeScrollProgressBar();
    })
    .catch(error => {
        console.error('Error fetching or rendering markdown:', error);
        if (articleContent) {
            articleContent.innerHTML = '<p style="color: #f88;">Error: Could not load article content.</p>';
        }
    });


function initializeAudioPlayer() {
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
    let startX = 0;
    let startY = 0;

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

    // Loading indicator events
    audio.addEventListener('waiting', () => {
        pill.classList.add('is-loading');
    });
    audio.addEventListener('playing', () => {
        pill.classList.remove('is-loading');
    });
    audio.addEventListener('canplay', () => {
        pill.classList.remove('is-loading');
    });

    const handleDrag = (e) => {
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaX = Math.abs(currentX - startX);
        const deltaY = Math.abs(currentY - startY);

        // Only consider as drag if moved beyond threshold (10px)
        if (!didMove && (deltaX > 10 || deltaY > 10)) {
            didMove = true;
            // NEW: Pause only now, when actual drag starts
            if (wasPlayingBeforeDrag) {
                audio.pause();
            }
        }

        if (!didMove) return; // Ignore small movements

        activatePlayer();
        if (!isFinite(audio.duration) || audio.duration <= 0) return;
        const rect = pill.getBoundingClientRect();
        const x = currentX - rect.left;
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
            if (audio.paused) {
                audio.play().catch((error) => {
                    console.error('Audio play error:', error);
                    pill.classList.remove('is-loading');
                });
            } else {
                audio.pause();
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
        wasPlayingBeforeDrag = !audio.paused; // Simplified: true if playing
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        // REMOVED: No temporary pause here
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
    // --- Function to handle the scroll progress bar ---
    function initializeScrollProgressBar() {
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (!progressBar) return;

        const updateProgressBar = () => {
            // The total scrollable height of the page
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            
            // Avoid division by zero if content is not scrollable
            if (scrollableHeight <= 0) {
                progressBar.style.width = '0%';
                return;
            }

            // How far down the user has scrolled
            const scrollTop = window.scrollY;

            // Calculate the percentage scrolled
            const scrollPercent = (scrollTop / scrollableHeight) * 100;

            progressBar.style.width = `${scrollPercent}%`;
        };

        // Listen for scroll events
        window.addEventListener('scroll', updateProgressBar, { passive: true });
        
        // Also update on resize in case the window dimensions change
        window.addEventListener('resize', updateProgressBar, { passive: true });

        // Initial call to set the bar correctly on page load/reload
        updateProgressBar();
    }
});