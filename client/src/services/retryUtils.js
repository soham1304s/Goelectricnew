/**
 * Retry utility with exponential backoff for API requests
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 5)
 * @param {number} baseDelay - Base delay in ms (default: 2000)
 * @param {Array<number>} retryOn - HTTP status codes to retry on (default: [429, 503, 504])
 * @returns {Promise}
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 5,
  baseDelay = 2000,
  retryOn = [429, 503, 504]
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const status = error.response?.status;
      const isRetryable = retryOn.includes(status);

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.warn(
        `Request failed with status ${status}. Retrying in ${Math.round(delay)}ms... (Attempt ${attempt + 1}/${maxRetries - 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
