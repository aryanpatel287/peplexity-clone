import { tavily } from '@tavily/core';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function searchWeb(query) {
    console.log('searchWeb called');

    const response = await tvly.search(query, {
        maxResults: 5,
    });

    const searchResults = JSON.stringify(response.results);
    // console.log('type of results: ', typeof searchResults.content);

    console.log(searchResults);

    return searchResults.content;
}
