document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - fetching episodes automatically');
    fetchEpisodes(1);

    const modal = document.getElementById('newsletterModal');
    const subscribeLinks = document.querySelectorAll('a[href="#newsletter"]');
    const closeBtn = document.querySelector('.close-modal');
    const emailForm = document.getElementById('emailForm');
    
    // Remove any existing error message divs to prevent duplicates
    const existingErrorDivs = emailForm.querySelectorAll('.error-message');
    existingErrorDivs.forEach(div => div.remove());
    
    // Create a single error message div
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    emailForm.querySelector('.form-group').appendChild(errorDiv);

    // Modal controls
    subscribeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
    });

    // Single form submission handler
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        const submitButton = emailForm.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Subscribing...';
            errorDiv.textContent = '';
            errorDiv.className = 'error-message';
            
            const response = await fetch('https://func-website-backend.azurewebsites.net/api/SaveEmail?', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.status === 200) {
                errorDiv.textContent = 'Thank you for subscribing! 🏴‍☠️';
                errorDiv.className = 'error-message success';
                emailForm.reset();
                setTimeout(closeModal, 2000);
            } else if (response.status === 400 && data.error === 'Email already exists in database') {
                errorDiv.textContent = 'You are already signed up! ⚓';
                errorDiv.className = 'error-message warning';
            } else {
                errorDiv.textContent = 'Failed to subscribe. Please try again.';
                errorDiv.className = 'error-message error';
            }
        } catch (error) {
            console.error('Subscription error:', error);
            errorDiv.textContent = 'A problem occurred. Please try again later.';
            errorDiv.className = 'error-message error';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    });

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        emailForm.reset();
        errorDiv.textContent = '';
        errorDiv.className = 'error-message';
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
        await fetchEpisodes(1); // Reset to page 1 on refresh
        console.log('Fetch completed successfully');
    } catch (error) {
        console.error('Error in handleRefreshClick:', error);
    }
    
    refreshButton.textContent = 'Refresh Episodes';
    refreshButton.disabled = false;
}

// In your client.js where you render episodes
const episodeElement = document.createElement('article');
episodeElement.className = `episode ${index === 0 ? 'featured' : ''}`;
// Add this before the episode content
if (index === 0) {
  const featuredLabel = document.createElement('div');
  featuredLabel.className = 'featured-label';
  featuredLabel.textContent = 'Latest Episode';
  episodeElement.appendChild(featuredLabel);
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
        
        const functionUrl = 'https://func-website-backend.azurewebsites.net/api/HttpTrigger1?';
        
        console.log('Making API request...');
        const response = await fetch(functionUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log(`Received ${data.blobs?.length || 0} episodes from API`);

        if (!data.blobs || !Array.isArray(data.blobs) || data.blobs.length === 0) {
            if (episodeContainer) {
                episodeContainer.innerHTML = `
                    <div class="loading-container">
                        <div class="pirate-ship">
                            <img src="/images/pirate-ship.svg" alt="Loading..." />
                        </div>
                        <div class="loading-text">New episodes coming soon! ☠️</div>
                    </div>
                `;
            }
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
            return;
        }

        // Sort episodes
        const episodes = data.blobs.sort((a, b) => {
            // Extract day numbers using a safer approach
            const getDayNumber = (name) => {
                const match = name.match(/day (\d+)/i);
                return match ? parseInt(match[1]) : 0;
            };
            
            const dayA = getDayNumber(a.name);
            const dayB = getDayNumber(b.name);
            
            return dayB - dayA;  // Sort in descending order (newest first)
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
        
        const response = await fetch('https://func-website-backend.azurewebsites.net/api/SaveEmail?', {
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