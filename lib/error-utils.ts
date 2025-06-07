/**
 * Checks if an API response indicates insufficient funds based on status code or content
 * @param response The fetch Response object
 * @returns true if the response indicates insufficient funds
 */
export async function checkForInsufficientFunds(response: Response): Promise<{isInsufficientFunds: boolean, error?: any}> {
  // Check status code first (402 Payment Required)
  if (response.status === 402) {
    try {
      const errorData = await response.json();
      const insufficientFundsError = createInsufficientFundsError(errorData.error?.message || 'Insufficient funds');
      return { isInsufficientFunds: true, error: errorData };
    } catch (e) {
      // If parsing fails, still treat 402 as insufficient funds
      return { isInsufficientFunds: true };
    }
  }

  // For other status codes, check the response body for insufficient funds indicators
  if (!response.ok) {
    try {
      const errorData = await response.clone().json();
      
      if (
        errorData.error?.type === 'InsufficientFunds' ||
        errorData.error?.message?.includes('Insufficient funds') ||
        errorData.message?.includes('Insufficient funds')
      ) {
        return { isInsufficientFunds: true, error: errorData };
      }
      
      return { isInsufficientFunds: false, error: errorData };
    } catch (e) {
      return { isInsufficientFunds: false };
    }
  }

  // For 200 OK responses, still check for insufficient funds messages in the body
  try {
    // Clone the response so we don't consume it
    const responseClone = response.clone();
    const data = await responseClone.json();
    
    if (
      data.error?.type === 'InsufficientFunds' ||
      data.error?.message?.includes('Insufficient funds') ||
      data.message?.includes('Insufficient funds')
    ) {
      return { isInsufficientFunds: true, error: data };
    }
    
    return { isInsufficientFunds: false };
  } catch (e) {
    // If we can't parse as JSON, it's not an insufficient funds error
    return { isInsufficientFunds: false };
  }
}

/**
 * Creates a standardized error for insufficient funds
 * @param message Optional custom error message
 * @returns Error object with name set to "InsufficientFundsError"
 */
export function createInsufficientFundsError(message: string = "Insufficient funds"): Error {
  const error = new Error(message);
  error.name = "InsufficientFundsError";
  return error;
}

/**
 * Checks if an error object is an insufficient funds error
 * @param error The error to check
 * @returns true if it's an insufficient funds error
 */
export function isInsufficientFundsError(error: any): boolean {
  return (
    error?.name === "InsufficientFundsError" || 
    error?.message?.includes("Insufficient funds") ||
    error?.error?.type === "InsufficientFunds"
  );
}
