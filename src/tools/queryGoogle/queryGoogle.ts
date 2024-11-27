import type { ToolFn } from 'types';
import puppeteer from 'puppeteer-extra';
import randomUseragent from 'random-useragent';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { z } from 'zod';
import { cleanHtml } from '@tools/queryGoogle/cleanHTML';
import logger from '@utils/logger';

// Apply stealth tactics using puppeteer-extra and stealth plugin
puppeteer.use(StealthPlugin());

// Define the function schema for queryGoogle
export const queryGoogleToolDefinition = {
  name: 'query_google',
  description:
    'Fetch Google search results and return the top-ranked URLs and titles based on relevance.',
  parameters: z
    .object({
      query: z
        .string()
        .describe(
          'The search query to use on Google. Example: "latest technology trends"'
        ),
      numOfResults: z
        .number()
        .describe(
          'The number of top search results to return, sorted by relevance. Example: 3'
        ),
    })
    .describe(
      'Input parameters for performing a Google search query, including the query text and number of results.'
    ),
  strict: true, // Enables structured output schema adherence
};

type Args = z.infer<typeof queryGoogleToolDefinition.parameters>;

const decodeGoogleRedirectUrl = (url: string): string => {
  try {
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get('q') || url; // Extract actual URL
  } catch (error) {
    logger.error('Error decoding Google redirect URL:', error);
    return url;
  }
};

// Helper function to fetch search results
async function fetchGoogleSearchResults(
  query: string
): Promise<Array<{ title: string; url: string }>> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log('fetchGoogleSearchResults matehamoe;');

  try {
    // Apply stealth tactics
    await page.setUserAgent(randomUseragent.getRandom());
    await page.setViewport({
      width: Math.floor(Math.random() * (1920 - 1024) + 1024),
      height: Math.floor(Math.random() * (1080 - 768) + 768),
    });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.google.com/',
    });

    console.log('Query:', query);

    await page.goto(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      {
        waitUntil: 'networkidle2',
        timeout: 30000,
      }
    );

    // Extract search results
    const results = await page.$$eval('h3', (elements) =>
      elements.map((element) => {
        const anchor = element.closest('a');
        return {
          title: element.textContent || '',
          url: anchor ? anchor.href : '',
        };
      })
    );

    // Decode URLs in Node.js context
    const decodedResults = results.map((result) => ({
      ...result,
      url: decodeGoogleRedirectUrl(result.url),
    }));

    console.log('here is results', decodedResults);

    return decodedResults;
  } catch (error) {
    console.error(
      `Error fetching Google search results for query "${query}":`,
      error
    );
    throw new Error('Failed to fetch Google search results');
  } finally {
    await browser.close();
  }
}

// Helper function to fetch and process page content
async function fetchPageContent(url: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Apply stealth tactics
    await page.setUserAgent(randomUseragent.getRandom());
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Get page content
    // const content = await page.evaluate(
    //   () => document.documentElement.outerHTML
    // )
    // Get page content
    const content = await page.evaluate(() => {
      try {
        // Try extracting content from the <body> tag (innerHTML)
        const bodyContent = document.body?.innerHTML;
        if (bodyContent && bodyContent.trim().length > 0) {
          console.log('Using innerHTML for page content.');
          return `<html><body>${bodyContent}</body></html>`;
        }

        // Fallback to the full outerHTML if innerHTML is empty or invalid
        console.log('Falling back to outerHTML for page content.');
        return document.documentElement.outerHTML;
      } catch (error) {
        console.error(
          'Failed to extract content, returning fallback error message:',
          error
        );
        return '<html><body>Error: Unable to extract page content</body></html>';
      }
    });

    return cleanHtml(content, url); // Clean raw HTML content
  } catch (error) {
    console.error(`Error fetching page content for ${url}:`, error);
    throw new Error(`Failed to fetch page content`);
  } finally {
    await browser.close();
  }
}

// Main tool function for queryGoogle
export const queryGoogle: ToolFn<Args, string> = async ({ toolArgs }) => {
  const { query, numOfResults } = toolArgs;

  // Fetch and rank search results
  const searchResults = await fetchGoogleSearchResults(query);

  const parsedNumOfResults = Number(numOfResults);
  const resultsCount =
    isNaN(parsedNumOfResults) || parsedNumOfResults <= 3
      ? 3
      : parsedNumOfResults;

  // Fetch and clean content from top results
  const processedResults = [];
  for (const result of searchResults.slice(0, resultsCount)) {
    try {
      const content = await fetchPageContent(result.url);
      processedResults.push(`**${result.title}**\n${content}\n\n`);
    } catch (error) {
      console.log('ERROR:', error);
      processedResults.push(
        `**${result.title}**\nError fetching content for this link.\n\n`
      );
    }
  }

  logger.info('Google search results processed successfully', processedResults);

  return processedResults.join('\n');
};
