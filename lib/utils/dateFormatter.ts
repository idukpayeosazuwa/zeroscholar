/**
 * Normalize any date format to ISO format (YYYY-MM-DD)
 * Handles: Dec 31st, 2025 | 2025-12-31 | 12/31/2025 | December 31, 2025
 * @param dateString - Any date format
 * @returns ISO date string (YYYY-MM-DD) or original string if unparseable
 */
export function normalizeDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';

  try {
    // If already ISO format (YYYY-MM-DD), return as is
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If special values, return as is
    if (typeof dateString === 'string' && ['Not Specified', 'Open Deadline', ''].includes(dateString)) {
      return dateString;
    }

    // Remove ordinal suffixes (1st, 2nd, 3rd, 4th, etc.) to help parsing
    let cleanedDateString = dateString;
    if (typeof dateString === 'string') {
      cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/g, '$1');
    }

    // Parse the date
    const date = new Date(cleanedDateString);
    
    if (isNaN(date.getTime())) {
      return typeof dateString === 'string' ? dateString : '';
    }

    // Convert to ISO format (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return typeof dateString === 'string' ? dateString : '';
  }
}

/**
 * Format a date string consistently across the application
 * @param dateString - ISO date string or Date object
 * @param format - 'short' | 'medium' | 'long'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date | null | undefined,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!dateString) return 'No date';

  // Handle special strings
  if (typeof dateString === 'string') {
    if (dateString === 'Not Specified' || dateString === 'Open Deadline') {
      return dateString;
    }
    
    // Normalize the date first to handle any format
    const normalized = normalizeDate(dateString);
    if (normalized && normalized !== dateString) {
      dateString = normalized;
    }
  }

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      medium: { month: 'long', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    }[format];

    return date.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get relative time string (e.g., "2 days left", "Expired")
 * @param deadlineString - ISO date string
 * @returns Relative time string with status
 */
export function getDeadlineStatus(deadlineString: string | Date | null | undefined): {
  text: string;
  isExpired: boolean;
  isUrgent: boolean;
} {
  if (!deadlineString) {
    return { text: 'No deadline', isExpired: false, isUrgent: false };
  }

  try {
    const deadline = new Date(deadlineString);
    const now = new Date();
    
    deadline.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Expired', isExpired: true, isUrgent: false };
    }
    
    if (diffDays === 0) {
      return { text: 'Expires today', isExpired: false, isUrgent: true };
    }
    
    if (diffDays === 1) {
      return { text: '1 day left', isExpired: false, isUrgent: true };
    }
    
    if (diffDays <= 7) {
      return { text: `${diffDays} days left`, isExpired: false, isUrgent: true };
    }
    
    if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return { 
        text: weeks === 1 ? '1 week left' : `${weeks} weeks left`, 
        isExpired: false, 
        isUrgent: false 
      };
    }

    const months = Math.floor(diffDays / 30);
    return { 
      text: months === 1 ? '1 month left' : `${months} months left`, 
      isExpired: false, 
      isUrgent: false 
    };
  } catch {
    return { text: 'Invalid date', isExpired: false, isUrgent: false };
  }
}
