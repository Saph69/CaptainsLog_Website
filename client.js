document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - fetching episodes automatically');
    fetchEpisodes(); // Load episodes immediately
    
    // Set up refresh button
    const refreshButton = document.getElementById('revealButton');
    if (refreshButton) {
        refreshButton.textContent = 'Refresh Episodes';
        refreshButton.addEventListener('click', handleRefreshClick);
        console.log('Refresh button listener added');
    } else {
        console.error('Refresh button not found');
    }
});

// Handle refresh button click
async function handleRefreshClick() {
    const refreshButton = document.getElementById('revealButton');
    refreshButton.disabled = true;  // Prevent double-clicks
    refreshButton.textContent = 'Refreshing...';
    
    await fetchEpisodes();
    
    refreshButton.textContent = 'Refresh Episodes';
    refreshButton.disabled = false;
}

async function fetchEpisodes() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const episodeContainer = document.getElementById('episodeContainer');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
        
        const functionUrl = 'https://func-website-backend.azurewebsites.net/api/HttpTrigger1';
        const functionKey = window.__env__ && window.__env__.FUNCTION_KEY;
        
        if (!functionKey) {
            throw new Error('Function key not found in environment variables');
        }
        
        const response = await fetch(`${functionUrl}?code=${functionKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('1. Starting fetch episodes...');
        const responseText = await response.text();
        console.log('3. Raw response text:', responseText);
        
        let episodes;
        try {
            episodes = JSON.parse(responseText);
            console.log('4. Parsed episodes:', episodes);
        } catch (parseError) {
            throw new Error(`Failed to parse JSON: ${responseText}`);
        }
        
        if (!Array.isArray(episodes)) {
            console.log('5. Unexpected data type:', typeof episodes);
            throw new Error(`Expected array of episodes but got: ${typeof episodes}`);
        }

        console.log('6. Number of episodes:', episodes.length);

        // Clear existing episodes
        episodeContainer.innerHTML = '';
        
        if (episodes.length === 0) {
            console.log('7. No episodes found');
            errorContainer.style.display = 'block';
            errorContainer.textContent = 'No episodes found.';
            return;
        }
        
        // Add episodes to the container
        episodes.forEach((episode, index) => {
            console.log(`8. Processing episode ${index}:`, episode);
            const episodeElement = document.createElement('div');
            episodeElement.className = 'episode';
            episodeElement.innerHTML = `
                <h2>${episode.title || 'Untitled Episode'}</h2>
                <audio controls>
                    <source src="${episode.url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="episode-date">${episode.date ? new Date(episode.date).toLocaleDateString() : 'No date'}</div>
                <div class="episode-size">${formatFileSize(episode.size)}</div>
            `;
            episodeContainer.appendChild(episodeElement);
            console.log(`9. Added episode ${index} to container`);
        });

        console.log('10. Finished processing all episodes');
    } catch (error) {
        console.error('Error fetching episodes:', error);
        errorContainer.style.display = 'block';
        errorContainer.textContent = `Error: ${error.message}`;
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
