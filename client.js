document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - JavaScript is running!');
    
    const episodeContainer = document.getElementById('episodeContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const revealButton = document.getElementById('revealButton');

    // Check if elements are found
    console.log('Elements found:', {
        episodeContainer: !!episodeContainer,
        loadingSpinner: !!loadingSpinner,
        errorContainer: !!errorContainer,
        revealButton: !!revealButton
    });

    // Add this to verify the button click is working
    revealButton.addEventListener('click', () => {
        console.log('Reveal button clicked!');
        fetchEpisodes();
    });

    async function fetchEpisodes() {
        try {
            loadingSpinner.style.display = 'block';
            errorContainer.style.display = 'none';
            
            console.log('1. Starting fetch episodes...');
            const response = await fetch('https://func-website-backend.azurewebsites.net/api/HttpTrigger1?code=3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('2. Response received:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers)
            });

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
            console.error('Error in fetchEpisodes:', {
                message: error.message,
                stack: error.stack,
                type: error.name
            });
            errorContainer.style.display = 'block';
            errorContainer.textContent = `Error: ${error.message}`;
        } finally {
            loadingSpinner.style.display = 'none';
            console.log('11. Fetch episodes completed');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Handle reveal button click
    revealButton.addEventListener('click', fetchEpisodes);
});
