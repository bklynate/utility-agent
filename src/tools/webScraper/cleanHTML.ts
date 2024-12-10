import Parser from '@postlight/parser';
import * as cheerio from 'cheerio';
import logger from '@utils/logger';
import { addMessages } from '@src/memory.ts';

const { parse } = Parser;

/**
 * Cleans and extracts meaningful text from a given HTML string using @postlight/parser.
 *
 * @param {string} html - The raw HTML content to clean and extract.
 * @param {string} url - The URL of the source HTML (required by @postlight/parser).
 * @returns {Promise<string>} - Cleaned and extracted text content.
 */
export async function cleanHtml(rawHtml: string, url: string): Promise<string> {
  try {
    // Use Cheerio to clean up the HTML
    const $ = cheerio.load(rawHtml);

    // Remove unwanted elements like scripts and styles
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

    // Selectors for specifically hidden elements or inline styles
    const hiddenSelectors = [
      '*[style*="display:none"]',
      '*[style*="visibility:hidden"]',
      'iframe[style*="display:none"]',
      'iframe[style*="visibility:hidden"]',
    ];

    // Combine selectors into one array
    const allSelectors = [...unwantedSelectors, ...hiddenSelectors];

    $(allSelectors.join(', ')).remove();

    const html = $.html();

    logger.info('Starting HTML processing with @postlight/parser');

    // Use @postlight/parser to extract and clean content
    const parsedContent = await parse(url, { html, contentType: 'text' });

    if (!parsedContent || !parsedContent.content) {
      await addMessages([
        {
          role: 'assistant',
          content: `Something went wrong while parsing the content from ${url}. Let me try to assist you in another way.`,
        },
      ]);
      logger.error(`Parsing failed for URL: ${url}`);
      return '';
    }

    // Clean up and process the extracted content
    const cleanedContent = parsedContent.content
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim(); // Remove leading and trailing whitespace

    logger.info(
      'HTML processing completed successfully with @postlight/parser'
    );

    return cleanedContent;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        'Error processing HTML with @postlight/parser:',
        error.message
      );
      throw new Error(`Error processing content: ${error.message}`);
    }
    logger.error(
      'Unexpected error processing HTML with @postlight/parser:',
      error
    );
    throw new Error('An unexpected error occurred during content processing.');
  }
}
