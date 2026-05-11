import { tavily } from '@tavily/core';
import envConfig from '../config/envconfig.js';

const tvly = tavily({ apiKey: envConfig.TAVILY_API_KEY });

export async function searchWeb(query) {
    const response = await tvly.search(query, {
        maxResults: 5,
    });

    const searchResults = JSON.stringify(response.results);

    return searchResults;
}
