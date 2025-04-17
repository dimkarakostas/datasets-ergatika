// Helper functions for data handling

/**
 * Safely parses JSON data and handles potential errors
 */
export async function safelyFetchJson(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }

    const text = await response.text()

    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      console.error("First 100 characters of response:", text.substring(0, 100))
      throw new Error("Failed to parse JSON data. The file may be corrupted or not in JSON format.")
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}

/**
 * Loads the JSON data directly from the provided content
 * This is a fallback in case fetching from files doesn't work
 */
export function loadHardcodedData(datasetId: string) {
  // This would contain the actual JSON data if needed
  // For now, we'll return an empty object
  return {}
}
