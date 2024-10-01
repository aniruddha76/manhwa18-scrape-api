import express from "express";
import getManhwa from "./scrape.js"; 
import cors from "cors";
import getManhwaChapters from "./scrape-chapters.js";

const app = express();
const port = 3001;

const corsOptions = {
    origin: 'http://localhost:3000/webtoon', // Your Next.js app's origin
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send("Server is Running OK!");
});

// Update the /chapters route to handle search queries
app.get('/webtoon', async (req, res) => {
    const searchQuery = req.query.search; // Get the search term from the query string

    if (!searchQuery) {
        return res.status(400).send({ error: "Search query is required" });
    }

    try {
        const data = await getManhwa(searchQuery); // Pass the search term to your scraper
        res.json(data); // Send the scraped data as a JSON response
    } catch (error) {
        console.error("Error fetching chapters:", error);
        res.status(500).send({ error: "Error fetching chapters" });
    }
});

app.get('/chapters', async (req, res) => {
    const searchQuery = req.query.search; // Get the search term from the query string
    const manhwaName = searchQuery.split(" ")[0];
    const chapter = searchQuery.split(" ")[1];

    if (!searchQuery) {
        return res.status(400).send({ error: "Search query is required" });
    }

    try {
        const data = await getManhwaChapters(manhwaName, chapter); // Pass the search term to your scraper
        res.json(data); // Send the scraped data as a JSON response
    } catch (error) {
        console.error("Error fetching chapters:", error);
        res.status(500).send({ error: "Error fetching chapters" });
    }
});

app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
});
