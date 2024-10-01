import axios from "axios";

// List of different user agents to rotate between requests
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function getManhwaChapters(manhwaName, chapter, retries = 5, delay = 2000) {
    let chapterPages = [];

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {

            const response = await axios.get(`https://manhwa18.cc/webtoon/${manhwaName}/chapter-${chapter}`, {
                headers: {
                    'User-Agent': getRandomUserAgent()
                }
            });

            const mangaData = response.data;

            // Regex to capture both src and data-src
            const imgRegex = /<img[^>]+(?:src|data-src)="(https:\/\/img\d{2}\.mnhwa002\.xyz\/uploads\/[^">]+)"/g;
            let match;

            while ((match = imgRegex.exec(mangaData)) !== null) {
                chapterPages.push(match[1]);
            }

            if (chapterPages.length > 0) {
                return chapterPages;
            }

            console.log("No pages found. Retrying...");

        } catch (error) {
            console.error("Error fetching the webpage:", error);

            if (error.response && error.response.status === 404) {
                return ["Yo! Whatever you're searching ain't here!"];
            }
        }

        await sleep(delay);
    }

    return ["Failed to fetch data after several attempts."];
}
