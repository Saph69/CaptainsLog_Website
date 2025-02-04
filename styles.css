document.addEventListener('DOMContentLoaded', () => {
    const revealButton = document.getElementById('revealButton');
    if (revealButton) {
        revealButton.addEventListener('click', handleRevealClick);
        console.log('Reveal button listener added');
    } else {
        console.error('Reveal button not found');
    }
});

// Separate function to handle reveal button click
async function handleRevealClick() {
    const revealButton = document.getElementById('revealButton');
    const episodeContainer = document.getElementById('episodeContainer');
    
    revealButton.disabled = true;  // Prevent double-clicks
    revealButton.textContent = 'Loading...';
    
    await fetchEpisodes();
    
    // Scroll to episode container
    episodeContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
    });
    
    revealButton.textContent = 'Refresh Episodes';
    revealButton.disabled = false;
}

async function fetchEpisodes() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const episodeContainer = document.getElementById('episodeContainer');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
        
        const response = await fetch('https://func-website-backend.azurewebsites.net/api/HttpTrigger1?code=3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Clear existing episodes
        episodeContainer.innerHTML = '';
        
        if (!data.blobs || data.blobs.length === 0) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = 'No episodes found.';
            return;
        }
        
        // Add episodes to the container
        data.blobs.forEach((episode, index) => {
            const episodeElement = document.createElement('div');
            episodeElement.className = 'episode';
            
            const date = new Date(episode.lastModified);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Create a more user-friendly title
            const title = episode.name
                .replace('.mp3', '')
                .replace(/Captains Log day (\d+)/i, 'Day $1: Captain\'s Log');

            episodeElement.innerHTML = `
                <h2>${title}</h2>
                <div class="episode-meta">
                    <span class="episode-date">${formattedDate}</span>
                    <span class="episode-size">${formatFileSize(episode.size)}</span>
                </div>
                <div class="audio-player">
                    <audio controls preload="none">
                        <source src="${episode.url}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            `;
            
            episodeContainer.appendChild(episodeElement);
        });

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
