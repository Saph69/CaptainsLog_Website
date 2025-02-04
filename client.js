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
            
            console.log('Attempting to fetch episodes...');
            const response = await fetch('https://func-website-backend.azurewebsites.net/api/episodes', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers));
            
            const responseText = await response.text(); // Get raw response text
            console.log('Raw response:', responseText);
            
            let episodes;
            try {
                episodes = JSON.parse(responseText);
                console.log('Parsed episodes:', episodes);
            } catch (parseError) {
                throw new Error(`Failed to parse JSON: ${responseText}`);
            }
            
            if (!Array.isArray(episodes)) {
                throw new Error(`Expected array of episodes but got: ${typeof episodes}`);
            }

            // Clear existing episodes
            episodeContainer.innerHTML = '';
            
            if (episodes.length === 0) {
                console.log('No episodes found in response');
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
                    <h2>${episode.title || 'Untitled'}</h2>
                    <p>${episode.content || 'No content available'}</p>
                    <div class="episode-date">${episode.date ? new Date(episode.date).toLocaleDateString() : 'No date'}</div>
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

    // Handle reveal button click
    revealButton.addEventListener('click', fetchEpisodes);
});
