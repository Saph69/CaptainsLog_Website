document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - fetching episodes automatically');
    fetchEpisodes(); // Load episodes immediately
    
    // Set up refresh button
    const refreshButton = document.getElementById('revealButton');
    if (refreshButton) {
        refreshButton.textContent = 'Refresh Episodes';
        refreshButton.addEventListener('click', () => {
            console.log('Button clicked!');
            handleRefreshClick();
        });
        console.log('Refresh button listener added');
    } else {
        console.error('Refresh button not found');
    }

    // Add event listener to the form
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmission);
    }
});

// Handle refresh button click
async function handleRefreshClick() {
    console.log('Starting refresh...');
    const refreshButton = document.getElementById('revealButton');
    refreshButton.disabled = true;  // Prevent double-clicks
    refreshButton.textContent = 'Refreshing...';
    
    try {
        console.log('Calling fetchEpisodes...');
        await fetchEpisodes();
        console.log('Fetch completed successfully');
    } catch (error) {
        console.error('Error in handleRefreshClick:', error);
    }
    
    refreshButton.textContent = 'Refresh Episodes';
    refreshButton.disabled = false;
}

async function fetchEpisodes() {
    console.log('fetchEpisodes started');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const episodeContainer = document.getElementById('episodeContainer');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
        
        const functionUrl = 'https://func-website-backend.azurewebsites.net/api/HttpTrigger1';
        const functionKey = '3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg==';
        
        console.log('1. Making fetch request...');
        const response = await fetch(`${functionUrl}?code=${functionKey}`);
        console.log('2. Fetch response received:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('3. Response text:', responseText.substring(0, 200) + '...');
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('4. Parsed data:', data);
        } catch (parseError) {
            console.error('Parse error:', parseError);
            throw new Error(`Failed to parse JSON: ${responseText}`);
        }
        
        if (!data.blobs || !Array.isArray(data.blobs)) {
            console.log('5. Data structure:', data);
            throw new Error(`Expected array of episodes in data.blobs but got: ${typeof data.blobs}`);
        }

        const episodes = data.blobs;
        console.log('6. Number of episodes:', episodes.length);

        // Sort episodes numerically by day number
        episodes.sort((a, b) => {
            // Extract day numbers from episode names
            const dayA = parseInt(a.name.match(/day (\d+)/i)[1]);
            const dayB = parseInt(b.name.match(/day (\d+)/i)[1]);
            return dayB - dayA; // Sort in descending order (newest first)
        });

        // Clear existing episodes
        if (episodeContainer) episodeContainer.innerHTML = '';
        
        if (episodes.length === 0) {
            console.log('7. No episodes found');
            if (errorContainer) {
                errorContainer.style.display = 'block';
                errorContainer.textContent = 'No episodes found.';
            }
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
            if (episodeContainer) episodeContainer.appendChild(episodeElement);
            console.log(`9. Added episode ${index}`);
        });

        console.log('10. Finished processing all episodes');
    } catch (error) {
        console.error('Error in fetchEpisodes:', error);
        if (errorContainer) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = `Error: ${error.message}`;
        }
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

// Updated email submission handler
async function handleEmailSubmission(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('emailInput');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = event.target.querySelector('button');
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        errorMessage.textContent = 'Please enter a valid email address';
        return;
    }

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';
        
        const response = await fetch('https://func-website-backend.azurewebsites.net/api/SaveEmail?code=RQdbP3X1HQVIzQlNIYUMUViEYWOMlCB3XyyolliyZEhpAzFualSqnQ==', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailInput.value
            })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.status === 400 && data.error === 'Email already exists in database') {
            console.log('Duplicate email detected');
            errorMessage.textContent = 'This email is already subscribed';
            return;
        }

        if (!response.ok) {
            console.log('Response not OK');
            throw new Error(data.error || data.message || 'Failed to subscribe');
        }

        // Success
        emailInput.value = '';
        errorMessage.textContent = '';
        alert('Thank you for subscribing!');

    } catch (error) {
        console.error('Detailed subscription error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        errorMessage.textContent = error.message || 'Failed to subscribe. Please try again later.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe';
    }
}
