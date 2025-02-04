// ... existing code ...
    async function fetchEpisodes() {
        try {
            loadingSpinner.style.display = 'block';
            errorContainer.style.display = 'none';
            
            console.log('Attempting to fetch episodes...');
            const response = await fetch('https://func-website-backend.azurewebsites.net/api/HttpTrigger1?code=3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            
            const episodes = await response.json();
            console.log('Episodes:', episodes);
            
            if (!Array.isArray(episodes)) {
                throw new Error(`Expected array of episodes but got: ${typeof episodes}`);
            }

            // Clear existing episodes
            episodeContainer.innerHTML = '';
            
            if (episodes.length === 0) {
                console.log('No episodes found');
                errorContainer.style.display = 'block';
                errorContainer.textContent = 'No episodes found.';
                return;
            }
            
            // Add episodes to the container
            episodes.forEach(episode => {
                console.log('Processing episode:', episode);
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
            });
        } catch (error) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = `Error: ${error.message}`;
            console.error('Detailed error information:', {
                message: error.message,
                stack: error.stack,
                type: error.name
            });
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
// ... existing code ...
