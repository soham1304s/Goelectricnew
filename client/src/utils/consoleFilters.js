// Filter out non-critical console warnings from third-party libraries
export const setupConsoleFilters = () => {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;

  // Patterns to suppress (non-critical warnings)
  const suppressPatterns = [
    /Unrecognized feature: 'web-share'/i,
    /Refused to get unsafe header/i,
    /Permissions policy violation/i,
    /The devicemotion events are blocked/i,
    /The deviceorientation events are blocked/i,
    /\[Violation\]/i,
  ];

  // Enhanced warn that filters known issues
  console.warn = function (...args) {
    const message = args[0]?.toString() || '';
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Enhanced error that filters known issues
  console.error = function (...args) {
    const message = args[0]?.toString() || '';
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));

    // Always log actual errors, but suppress warnings logged as errors
    if (!shouldSuppress || message.includes('Error:')) {
      originalError.apply(console, args);
    }
  };
};

export default setupConsoleFilters;
