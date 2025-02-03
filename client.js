async function loadEpisodes() {
    try {
        const response = await fetch('https://your-function-app.azurewebsites.net/api/episodes');
        const episodes = await response.json();
        displayEpisodes(episodes);
    } catch (error) {
        console.error('Error loading episodes:', error);
    }
}
