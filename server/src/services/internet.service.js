import { tavily } from '@tavily/core';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function searchWeb(query) {
    const response = await tvly.search(query, {
        maxResults: 5,
    });

    const searchResults = JSON.stringify(response.results);

    return searchResults;
}
