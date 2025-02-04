async function fetchEpisodes() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const episodeContainer = document.getElementById('episodeContainer');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
        
        const functionUrl = 'https://func-website-backend.azurewebsites.net/api/HttpTrigger1';
        const functionKey = '3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==';
        
        console.log('1. Fetching from URL:', functionUrl);
        const response = await fetch(`${functionUrl}?code=${functionKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('2. Got response:', response.status);
        const responseText = await response.text();
        console.log('3. Raw response text:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('4. Parsed data:', data);
            console.log('4a. Data type:', typeof data);
            console.log('4b. Data keys:', Object.keys(data));
            if (data.blobs) {
                console.log('4c. Blobs array:', data.blobs);
                console.log('4d. Number of blobs:', data.blobs.length);
            }
        } catch (parseError) {
            throw new Error(`Failed to parse JSON: ${responseText}`);
        }
        
        if (!data.blobs || !Array.isArray(data.blobs)) {
            console.log('5. Unexpected data structure:', data);
            throw new Error(`Expected array of episodes in data.blobs but got: ${typeof data.blobs}`);
        }

        const episodes = data.blobs;
        console.log('6. Episodes array:', episodes);

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
            
            // Format the episode name
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
            console.log(`9. Added episode ${index} to container:`, episodeElement.innerHTML);
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
