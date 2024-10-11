import axios from "axios";

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

    for (let attempt = 1; attempt <= retries; attempt++) {

        let chapterPages = [];
        let availableChapters = new Set();  // Use a Set to ensure unique chapters

        try {
            const response = await axios.get(`https://manhwa18.cc/webtoon/${manhwaName}/chapter-${chapter}`, {
                headers: {
                    'User-Agent': getRandomUserAgent()
                }
            });

            const mangaData = response.data;

            const imgRegex = /<img[^>]+(?:src|data-src)="(https:\/\/img\d{2}\.mnhwa002\.xyz\/uploads\/[^">]+)"/g;
            let imgMatch;

            const chapterRegex = /<option[^>]+data-c="([^"]+)"[^>]*>([^<]+)<\/option>/g;
            let chapterMatch;

            // Collect chapter pages
            while ((imgMatch = imgRegex.exec(mangaData)) !== null) {
                chapterPages.push(imgMatch[1]);
            }

            // Collect available chapters, ensuring uniqueness with Set
            while ((chapterMatch = chapterRegex.exec(mangaData)) !== null) {
                availableChapters.add(chapterMatch[2]);  // Use .add() for Set
            }

            if (chapterPages.length > 0) {
                return {
                    chapterPages: chapterPages,
                    availableChapters: Array.from(availableChapters)  // Convert Set back to array
                };
            }

            console.log("No pages found. Retrying...");

        } catch (error) {
            console.error("Error fetching the webpage:", error);

            if (error.response && error.response.status === 404) {
                return {
                    chapterPages: ["Yo! Whatever you're searching ain't here!"],
                    availableChapters: []
                };
            }
        }

        await sleep(delay);
    }

    return {
        chapterPages: ["Failed to fetch data after several attempts."],
        availableChapters: []
    };
}
