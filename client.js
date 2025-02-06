document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - fetching episodes automatically');
    fetchEpisodes(1);

    // Add event listener to the form
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmission);
    }

    const modal = document.getElementById('newsletterModal');
    const subscribeLinks = document.querySelectorAll('a[href="#newsletter"]');
    const closeBtn = document.querySelector('.close-modal');

    // Open modal when Subscribe is clicked
    subscribeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Handle refresh button click
async function handleRefreshClick() {
    console.log('Starting refresh...');
    const refreshButton = document.getElementById('revealButton');
    refreshButton.disabled = true;  // Prevent double-clicks
    refreshButton.textContent = 'Refreshing...';
    
    try {
        console.log('Calling fetchEpisodes...');
        await fetchEpisodes(1); // Reset to page 1 on refresh
        console.log('Fetch completed successfully');
    } catch (error) {
        console.error('Error in handleRefreshClick:', error);
    }
    
    refreshButton.textContent = 'Refresh Episodes';
    refreshButton.disabled = false;
}

async function fetchEpisodes(page = 1, itemsPerPage = 10) {
    console.log(`Fetching episodes for page ${page} with ${itemsPerPage} items per page`);
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorContainer = document.getElementById('errorContainer');
    const episodeContainer = document.getElementById('episodeContainer');
    const paginationContainer = document.getElementById('paginationContainer');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorContainer) errorContainer.style.display = 'none';
        
        const functionUrl = 'https://func-website-backend.azurewebsites.net/api/HttpTrigger1?code=3teAYWB1X3ArvHMD7_XypbjgEpk7Lo4VZBZzfZ2Pgd2GAzFu94tslg%3D%3D';
        
        console.log('Making API request...');
        const response = await fetch(functionUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log(`Received ${data.blobs?.length || 0} episodes from API`);

        if (!data.blobs || !Array.isArray(data.blobs)) {
            throw new Error(`Expected array of episodes but got: ${typeof data.blobs}`);
        }

        // Sort episodes
        const episodes = data.blobs.sort((a, b) => {
            const dayA = parseInt(a.name.match(/day (\d+)/i)[1]);
            const dayB = parseInt(b.name.match(/day (\d+)/i)[1]);
            return dayB - dayA;
        });

        // Calculate pagination
        const totalPages = Math.ceil(episodes.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageEpisodes = episodes.slice(startIndex, endIndex);

        console.log(`Displaying episodes ${startIndex + 1} to ${Math.min(endIndex, episodes.length)} of ${episodes.length}`);

        // Clear and update episode container
        if (episodeContainer) {
            episodeContainer.innerHTML = '';
            
            currentPageEpisodes.forEach(episode => {
                const episodeElement = document.createElement('div');
                episodeElement.className = 'episode';
                
                const name = episode.name.replace('.mp3', '')
                    .replace(/^Captains Log day (\d+)/i, 'Day $1: Captain\'s Log');
                
                episodeElement.innerHTML = `
                    <h2>${name}</h2>
                    <audio controls>
                        <source src="${episode.url}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                    <div class="episode-date">
                        ${episode.lastModified ? new Date(episode.lastModified).toLocaleDateString() : 'No date'}
                    </div>
                    <div class="episode-size">${formatFileSize(episode.size)}</div>
                `;
                episodeContainer.appendChild(episodeElement);
            });
        }

        // Update pagination controls
        if (paginationContainer) {
            paginationContainer.innerHTML = `
                <div class="pagination">
                    ${page > 1 ? `<button onclick="fetchEpisodes(${page - 1}, ${itemsPerPage})">Previous</button>` : ''}
                    <span>Page ${page} of ${totalPages}</span>
                    ${page < totalPages ? `<button onclick="fetchEpisodes(${page + 1}, ${itemsPerPage})">Next</button>` : ''}
                </div>
            `;
        }

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