async function fetchEpisodes() {
    try {
        loadingSpinner.style.display = 'block';
        errorContainer.style.display = 'none';
        
        console.log('Fetching episodes...');
        const response = await fetch('https://func-website-backend.azurewebsites.net/api/HttpTrigger1?code=3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Episodes data:', data);

        // Clear existing episodes
        episodeContainer.innerHTML = '';
        
        if (!data.blobs || data.blobs.length === 0) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = 'No episodes found.';
            return;
        }
        
        // Add episodes to the container
        data.blobs.forEach(episode => {
            const episodeElement = document.createElement('div');
            episodeElement.className = 'episode';
            
            // Format the date
            const date = new Date(episode.lastModified);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            episodeElement.innerHTML = `
                <h2>${episode.name.replace('.mp3', '')}</h2>
                <audio controls>
                    <source src="${episode.url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="episode-date">${formattedDate}</div>
                <div class="episode-size">${formatFileSize(episode.size)}</div>
            `;
            episodeContainer.appendChild(episodeElement);
        });

    } catch (error) {
        console.error('Error fetching episodes:', error);
        errorContainer.style.display = 'block';
        errorContainer.textContent = `Error: ${error.message}`;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
