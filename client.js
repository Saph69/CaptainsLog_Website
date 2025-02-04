async function fetchEpisodes() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const episodeContainer = document.getElementById('episodeContainer');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
        
        const functionUrl = 'https://func-website-backend.azurewebsites.net/api/HttpTrigger1';
        const functionKey = '3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==';
        
        const response = await fetch(`${functionUrl}?code=${functionKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('1. Starting fetch episodes...');
        const responseText = await response.text();
        console.log('3. Raw response text:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('4. Parsed data:', data);
        } catch (parseError) {
            throw new Error(`Failed to parse JSON: ${responseText}`);
        }
        
        if (!data.blobs || !Array.isArray(data.blobs)) {
            console.log('5. Unexpected data type:', typeof data.blobs);
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
        
        // Add episodes to the container
        episodes.forEach((episode, index) => {
            console.log(`8. Processing episode ${index}:`, episode);
            const episodeElement = document.createElement('div');
            episodeElement.className = 'episode';
            episodeElement.innerHTML = `
                <h2>${episode.name.replace('.mp3', '') || 'Untitled Episode'}</h2>
                <audio controls>
                    <source src="${episode.url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="episode-date">${episode.lastModified ? new Date(episode.lastModified).toLocaleDateString() : 'No date'}</div>
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
