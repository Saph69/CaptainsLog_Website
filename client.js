// Replace direct Azure calls with API calls
async function loadEpisodes() {
    try {
        const response = await fetch('/api/episodes');
        const episodes = await response.json();
        displayEpisodes(episodes);
    } catch (error) {
        console.error('Error loading episodes:', error);
    }
}

// Add scroll functionality
function scrollToEpisodes() {
    const content = document.querySelector('.content-wrapper');
    content.scrollIntoView({ behavior: 'smooth' });
}

// Function to display episodes
function displayEpisodes(episodes) {
    const container = document.getElementById('episodeContainer');
    container.innerHTML = ''; // Clear existing content

    episodes.forEach(episode => {
        const episodeElement = document.createElement('div');
        episodeElement.className = 'episode';
        episodeElement.innerHTML = `
            <div class="episode-info">
                <h2>${episode.title}</h2>
                <p class="date">${episode.date}</p>
                <p>${episode.description}</p>
            </div>
            <audio controls>
                <source src="${episode.audioUrl}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        `;
        container.appendChild(episodeElement);
    });
}

// Add event listener when the document loads
document.addEventListener('DOMContentLoaded', () => {
    // Add click handler for reveal button
    const revealButton = document.getElementById('revealButton');
    if (revealButton) {
        revealButton.addEventListener('click', scrollToEpisodes);
    }
    
    // Load episodes
    loadEpisodes();
}); 