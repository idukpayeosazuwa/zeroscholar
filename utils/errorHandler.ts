/**
 * Utility for handling network errors and automatic retries
 * Helps distinguish between network issues and actual config problems
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly isNetworkError: boolean = false,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Classify errors into categories for better user feedback
 */
export const classifyError = (err: any) => {
  const message = err?.message || '';
  const code = err?.code;
  const isOnline = navigator.onLine;

  // Network-related errors
  if (!isOnline) {
    return { type: 'offline', message: 'No internet connection. Check your network.' };
  }

  if (
    message.includes('Failed to fetch') ||
    message.includes('Network') ||
    message.includes('timeout') ||
    message.includes('503') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT')
  ) {
    return { type: 'network', message: 'Network error. Please check your connection and try again.' };
  }

  // Configuration errors
  if (code === 401 || message.includes('Project ID') || message.includes('unauthorized')) {
    return { type: 'config', message: 'Configuration error. Please contact support.' };
  }

  if (code === 404 || message.includes('not found') || message.includes('Collection')) {
    return { type: 'config', message: 'Database configuration error. Please contact support.' };
  }

  // Database schema errors
  if (message.includes('Unknown attribute')) {
    const attr = message.match(/Unknown attribute: "([^"]+)"/)?.[1];
    return { 
      type: 'schema', 
      message: `Database schema issue: '${attr}' is missing. This usually resolves in 1-2 minutes. Please try again.`
    };
  }

  if (message.includes('Invalid document structure')) {
    return { 
      type: 'schema', 
      message: 'Data validation error. Please check your inputs and try again.' 
    };
  }

  // Validation errors
  if (code === 400) {
    return { 
      type: 'validation', 
      message: message || 'Invalid request. Please check your inputs.' 
    };
  }

  // Default
  return { 
    type: 'unknown', 
    message: message || 'An error occurred. Please try again.' 
  };
};

/**
 * Retry a failed operation with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;

      // Don't retry on validation or config errors
      const classified = classifyError(err);
      if (['config', 'schema', 'validation'].includes(classified.type)) {
        throw err;
      }

      // For network errors, retry with backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError;
};

/**
 * Safe error message for UI display
 */
export const getErrorMessage = (err: any): string => {
  const classified = classifyError(err);
  
  // Log details for debugging
  console.error('[Error Classification]', {
    type: classified.type,
    originalMessage: err?.message,
    code: err?.code,
    isOnline: navigator.onLine
  });

  return classified.message;
};
