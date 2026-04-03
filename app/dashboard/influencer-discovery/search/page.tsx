import { Suspense } from "react"
import SearchResultsContent from "./SearchResultsContent"

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  )
}
