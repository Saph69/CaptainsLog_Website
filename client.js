// Add event listener for the reveal button
document.addEventListener('DOMContentLoaded', () => {
    const revealButton = document.getElementById('revealButton');
    if (revealButton) {
        revealButton.addEventListener('click', fetchEpisodes);
        console.log('Reveal button listener added');
    } else {
        console.error('Reveal button not found');
    }
});

async function fetchEpisodes() {
    try {
        // First verify our DOM elements exist
        const episodeContainer = document.getElementById('episodeContainer');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const errorContainer = document.getElementById('errorContainer');

        console.log('DOM elements check:', {
            episodeContainer: !!episodeContainer,
            loadingSpinner: !!loadingSpinner,
            errorContainer: !!errorContainer
        });

        if (!episodeContainer) {
            throw new Error('Episode container element not found');
        }

        loadingSpinner.style.display = 'block';
        errorContainer.style.display = 'none';
        
        console.log('1. Fetching episodes...');
        const response = await fetch('https://func-website-backend.azurewebsites.net/api/HttpTrigger1?code=3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==');
        
        console.log('2. Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('3. Episodes data:', data);

        // Clear existing episodes
        episodeContainer.innerHTML = '';
        console.log('4. Cleared episode container');
        
        if (!data.blobs || data.blobs.length === 0) {
            console.log('5. No episodes found in response');
            errorContainer.style.display = 'block';
            errorContainer.textContent = 'No episodes found.';
            return;
        }
        
        console.log('6. Processing episodes:', data.blobs.length);
        
        // Add episodes to the container
        data.blobs.forEach((episode, index) => {
            console.log(`7. Creating episode element ${index}:`, episode);
            const episodeElement = document.createElement('div');
            episodeElement.className = 'episode';
            
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
            console.log(`8. Added episode ${index} to container`);
        });

        console.log('9. Finished adding all episodes');

    } catch (error) {
        console.error('Error fetching episodes:', error);
        errorContainer.style.display = 'block';
        errorContainer.textContent = `Error: ${error.message}`;
    } finally {
        loadingSpinner.style.display = 'none';
        console.log('10. Process completed');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
