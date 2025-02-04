document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - fetching episodes automatically');
    fetchEpisodes(); // Load episodes immediately
    
    // Set up refresh button
    const refreshButton = document.getElementById('revealButton');
    if (refreshButton) {
        refreshButton.textContent = 'Refresh Episodes';
        refreshButton.addEventListener('click', () => {
            console.log('Button clicked!'); // Add this line
            handleRefreshClick();
        });
        console.log('Refresh button listener added');
    } else {
        console.error('Refresh button not found');
    }
});

// Handle refresh button click
async function handleRefreshClick() {
    console.log('Starting refresh...'); // Add this line
    const refreshButton = document.getElementById('revealButton');
    refreshButton.disabled = true;  // Prevent double-clicks
    refreshButton.textContent = 'Refreshing...';
    
    try {
        console.log('Calling fetchEpisodes...'); // Add this line
        await fetchEpisodes();
        console.log('Fetch completed successfully'); // Add this line
    } catch (error) {
        console.error('Error in handleRefreshClick:', error); // Add this line
    }
    
    refreshButton.textContent = 'Refresh Episodes';
    refreshButton.disabled = false;
}

async function fetchEpisodes() {
    console.log('fetchEpisodes started'); // Add this line
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const episodeContainer = document.getElementById('episodeContainer');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
        
        const functionUrl = 'https://func-website-backend.azurewebsites.net/api/HttpTrigger1';
        const functionKey = '3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==';
        
        console.log('1. Making fetch request...'); // Add this line
        const response = await fetch(`${functionUrl}?code=${functionKey}`);
        console.log('2. Fetch response received:', response.status); // Add this line
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('3. Response text:', responseText.substring(0, 200) + '...'); // Show first 200 chars
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('4. Parsed data:', data);
        } catch (parseError) {
            console.error('Parse error:', parseError); // Add this line
            throw new Error(`Failed to parse JSON: ${responseText}`);
        }
        
        if (!data.blobs || !Array.isArray(data.blobs)) {
            console.log('5. Data structure:', data); // Add this line
            throw new Error(`Expected array of episodes in data.blobs but got: ${typeof data.blobs}`);
        }

        const episodes = data.blobs;
        console.log('6. Number of episodes:', episodes.length);

        // Clear existing episodes
        episodeContainer.innerHTML = '';
        
        if (episodes.length === 0) {
            console.log('7. No episodes found');
            errorContainer.style.display = 'block';
            errorContainer.textContent = 'No episodes found.';
            return;
        }
        
        episodes.forEach((episode, index) => {
            console.log(`8. Processing episode ${index}:`, episode);
            const episodeElement = document.createElement('div');
            episodeElement.className = 'episode';
            
            const name = episode.name.replace('.mp3', '').replace(/^Captains Log day (\d+)/i, 'Day $1: Captain\'s Log');
            
            episodeElement.innerHTML = `
                <h2>${name}</h2>
                <audio controls>
                    <source src="${episode.url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="episode-date">${episode.lastModified ? new Date(episode.lastModified).toLocaleDateString() : 'No date'}</div>
                <div class="episode-size">${formatFileSize(episode.size)}</div>
            `;
            episodeContainer.appendChild(episodeElement);
            console.log(`9. Added episode ${index}`);
        });

        console.log('10. Finished processing all episodes');
    } catch (error) {
        console.error('Error in fetchEpisodes:', error); // Add this line
        errorContainer.style.display = 'block';
        errorContainer.textContent = `Error: ${error.message}`;
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}
