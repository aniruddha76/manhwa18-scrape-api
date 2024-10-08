import axios from "axios";

export default async function getManhwa(searchQuery) {
    const decodeHtmlEntities = (text) => {
        return text
            .replace(/&rsquo;/g, "’") // right single quotation mark
            .replace(/&lsquo;/g, "‘") // left single quotation mark
            .replace(/&ldquo;/g, "“") // left double quotation mark
            .replace(/&rdquo;/g, "”") // right double quotation mark
            .replace(/&hellip;/g, "…") // ellipsis
            .replace(/&amp;/g, "&") // ampersand
            .replace(/&lt;/g, "<") // less than symbol
            .replace(/&gt;/g, ">") // greater than symbol
            .replace(/&nbsp;/g, " "); // non-breaking space
    };

    const nameToSearch = searchQuery.replace(/ /g, "-");

    try {
        const response = await axios.get(`https://manhwa18.cc/webtoon/${nameToSearch}`);
        const mangaData = response.data;

        // Regular expressions to extract the data
        const mangaTitle = /<h1>\s*<span>.*?<\/span>\s*([^<]+)\s*<\/h1>/;
        const mangaImage = /<div class="summary_image">\s*<a href=".*?" title=".*?">\s*<img[^>]+src="([^"]+)"[^>]*>\s*<\/a>\s*<\/div>/;
        const mangaImageAndHref = /<div class="summary_image">\s*<a href="([^"]+)" title=".*?">\s*<img[^>]+src="([^"]+)"[^>]*>\s*<\/a>\s*<\/div>/;
        const mangaSummary = /<div class="panel-story-description">\s*<h2 class="manga-panel-title wleft">.*?<\/h2>\s*<div class="dsct">\s*((?:<p>.*?<\/p>\s*)+)<\/div>\s*<\/div>/;
        const mangaChapters = /<a class="chapter-name text-nowrap" href=".*?" title=".*?">(Chapter \d+)<\/a>/g;

        // Specifically target only the author/artist <a> tags
        const mangaAuthor = /<div class="author-content">\s*((?:<a href=".*?" rel="tag">[^<]+<\/a>\s*)+)<\/div>/;
        const mangaArtist = /<div class="artist-content">\s*((?:<a href=".*?" rel="tag">[^<]+<\/a>\s*)+)<\/div>/;

        const titleMatch = mangaData.match(mangaTitle);
        const imageMatch = mangaData.match(mangaImage);
        const imageAndHrefMatch = mangaData.match(mangaImageAndHref);
        const authorMatch = mangaData.match(mangaAuthor);
        const artistMatch = mangaData.match(mangaArtist);
        const summaryMatch = mangaData.match(mangaSummary);
        const chaptersMatch = [...mangaData.matchAll(mangaChapters)];

        if (titleMatch) {
            const title = titleMatch[1].trim();
            const image = imageMatch[1].trim();
            const href = imageAndHrefMatch[1].trim().split("/")[2];

            // Process authors and artists, ensuring we only get names from the <a> tags
            const author = authorMatch ? [...authorMatch[1].matchAll(/<a href=".*?" rel="tag">([^<]+)<\/a>/g)].map(match => match[1].trim()).join("/") : "Unknown";
            const artist = artistMatch ? [...artistMatch[1].matchAll(/<a href=".*?" rel="tag">([^<]+)<\/a>/g)].map(match => match[1].trim()).join("/") : "Unknown";

            //clean up the summary
            const summary = summaryMatch ? decodeHtmlEntities(summaryMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim()) : "No summary available.";
            
            //chapter list array
            const chapters = chaptersMatch.map(match => match[1].trim());

            return {
                title: title,
                image: image,
                slug: href,
                author: author,
                artist: artist,
                summary: summary,
                chapters: chapters
            };
        }
        
        return { message: "No data found for the given query." };
        
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { title: "Yo! Whatever you're searching ain't here!" };
        } else {
            console.error("Error fetching the webpage:", error);
            return { message: "An error occurred while fetching data." };
        }
    }
}
