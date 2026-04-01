/**
 * Returns the API base URL for server-side fetching.
 * In Docker: uses INTERNAL_API_URL (http://backend:4000/api) to reach backend via internal network.
 * Fallback: uses NEXT_PUBLIC_API_URL or localhost.
 */
export function getServerApiUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api'
  )
}
