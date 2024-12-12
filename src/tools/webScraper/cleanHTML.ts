import * as cheerio from 'cheerio';
import logger from '@utils/logger';
import { addMessages } from '@src/memory';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

process.env.ORT_LOG_SEVERITY_LEVEL = '3';
import { pipeline } from '@xenova/transformers';

let summarizer: any; // Will hold the summarization pipeline

/**
 * Initializes the summarization pipeline once (lazy loading).
 */
async function getSummarizer() {
  if (!summarizer) {
    logger.info('Loading summarization model...');
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
  }
  return summarizer;
}

/**
 * Summarize a given text using the summarization model.
 * This function attempts a hierarchical summarization if the text is too long.
 *
 * @param text - The text to summarize
 * @param chunkSize - Number of words per chunk
 * @returns The summarized text
 */
async function summarizeLongText(
  text: string,
  chunkSize = 512
): Promise<string> {
  const summarizationPipeline = await getSummarizer();

  const words = text.split(/\s+/);
  // If text is short enough, just summarize directly
  if (words.length <= chunkSize) {
    const summaryArray = await summarizationPipeline(text);
    return summaryArray?.[0]?.summary_text?.trim() || '';
  }

  // For longer text, split into chunks
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }

  // Summarize each chunk individually
  const chunkSummaries = [];
  for (const c of chunks) {
    const summaryArray = await summarizationPipeline(c);
    const chunkSummary = summaryArray?.[0]?.summary_text?.trim() || '';
    chunkSummaries.push(chunkSummary);
  }

  // Now we have multiple summaries. Combine them into one text.
  const combinedSummary = chunkSummaries.join(' ');

  // If combined summary is still too long, recursively summarize again
  if (combinedSummary.split(/\s+/).length > chunkSize) {
    return summarizeLongText(combinedSummary, chunkSize);
  } else {
    return combinedSummary;
  }
}

/**
 * Cleans and extracts meaningful text from a given HTML string using Cheerio,
 * and then summarizes it using a transformer-based summarization pipeline.
 * If the text is too long, it is chunked and summarized hierarchically.
 *
 * @param {string} rawHtml - The raw HTML content to clean and extract.
 * @param {string} url - The URL of the source HTML.
 * @returns {Promise<string>} - Cleaned and summarized text content.
 */
export async function cleanHtml(rawHtml: string, url: string): Promise<string> {
  try {
    const $ = cheerio.load(rawHtml);

    // Remove unwanted elements like scripts, styles, and various other noise
    const unwantedSelectors = [
      'script',
      'style',
      'link',
      'meta',
      'noscript',
      'iframe',
      'nav',
      'aside',
      'header',
      'footer',
      'form',
      'button',
      'input',
      'select',
      'textarea',
      '*[class*="footer"]',
      '*[class*="ad"]',
      '*[class*="promo"]',
      '*[class*="banner"]',
      '*[class*="popup"]',
      '*[class*="modal"]',
      '*[class*="overlay"]',
      '*[class*="social"]',
      '*[class*="breadcrumb"]',
      '*[class*="pagination"]',
      '*[class*="back-to-top"]',
      '*[class*="tracking"]',
      '*[class*="analytics"]',
      '*[class*="comment"]',
      '*[class*="review"]',
    ];

    const hiddenSelectors = [
      '*[style*="display:none"]',
      '*[style*="visibility:hidden"]',
      'iframe[style*="display:none"]',
      'iframe[style*="visibility:hidden"]',
    ];

    const allSelectors = [...unwantedSelectors, ...hiddenSelectors];
    const cleanedHTML = $.html();
    const dom = new JSDOM(cleanedHTML);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    let extractedText: string;
    if (article && article.textContent && article.textContent.trim()) {
      extractedText = article.textContent.replace(/\s{2,}/g, ' ').trim();
    } else {
      // Fallback if readability fails or returns empty
      extractedText = $('body')
        .text()
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    if (!extractedText) {
      await addMessages([
        {
          role: 'assistant',
          content: `No meaningful text content found from ${url}. Let me try to assist you in another way.`,
        },
      ]);
      logger.error(`No text extracted for URL: ${url}`);
      return '';
    }

    // Summarize the extracted text using chunking if necessary
    logger.info('Running summarization on extracted text...');
    const summary = await summarizeLongText(extractedText, 512);

    if (!summary) {
      await addMessages([
        {
          role: 'assistant',
          content: `Something went wrong while summarizing the content from ${url}. Let me try another approach.`,
        },
      ]);
      logger.error(`Summarization failed for URL: ${url}`);
      return '';
    }

    logger.info('HTML processing completed successfully with summarization');
    return summary;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        'Error processing HTML with transformer summarization:',
        error.message
      );
      throw new Error(`Error processing content: ${error.message}`);
    }
    logger.error(
      'Unexpected error processing HTML with transformer summarization:',
      error
    );
    throw new Error('An unexpected error occurred during content processing.');
  }
}
