"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, RefreshCw } from "lucide-react"

type Creator = {
  name: string
  username: string
  avatar: string
  followers: string
  engagement: string
  growth: string
  fee: string
  platform: string
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const topic = searchParams.get("topic")
  const platform = searchParams.get("platform")
  
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [additionalKeywords, setAdditionalKeywords] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [excludeSaved, setExcludeSaved] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState("AND")

  useEffect(() => {
    const loadCreators = async () => {
      setLoading(true)

      try {
        const res = await fetch("https://randomuser.me/api/?results=12")
        const data = await res.json()

        const mapped = data.results.map((u: any) => ({
          name: `${u.name.first} ${u.name.last}`,
          username: u.login.username,
          avatar: u.picture.medium,
          followers: Math.floor(Math.random() * 500 + 10) + "K",
          engagement: (Math.random() * 8 + 1).toFixed(2) + "%",
          growth: (Math.random() * 25 + 1).toFixed(1) + "%",
          fee: "$" + (Math.floor(Math.random() * 1500 + 200)),
          platform: platform || "Instagram"
        }))

        setCreators(mapped)
      } catch (error) {
        console.error("Error fetching creators:", error)
      } finally {
        setLoading(false)
      }
    }

    if (topic) {
      loadCreators()
    }
  }, [topic, platform])

  const getPlatformIcon = () => {
    switch(platform) {
      case "TikTok":
        return ""
      case "YouTube":
        return ""
      default:
        return ""
    }
  }

  const handleSearch = () => {
    if (additionalKeywords) {
      const combinedTopic = selectedOperator === "AND" 
        ? `${topic} ${additionalKeywords}`
        : `${topic} OR ${additionalKeywords}`
      
      router.push(`/dashboard/influencer-discovery/search?topic=${encodeURIComponent(
        combinedTopic
      )}&platform=${encodeURIComponent(platform || "Instagram")}`)
    }
  }

  const handleApplyPrevious = () => {
    console.log("Apply previous search")
  }

  const handleBackToSearch = () => {
    router.push("/dashboard/influencer-discovery")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9F8] via-white to-[#F7F9F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button
          onClick={handleBackToSearch}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#0F6B3E] transition group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Results for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E]">
              #{topic}
            </span>
          </h1>
          <p className="text-gray-600">
            Platform: <span className="font-medium">{platform}</span>
          </p>
        </div>

        {/* Search Bar UI */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl">{getPlatformIcon()}</span>
              
              <span className="text-sm text-gray-600">
                Show influencers who talk about
              </span>

              <div className="bg-gradient-to-r from-[#0F6B3E]/10 to-[#2A9D6E]/10 px-3 py-1.5 rounded-full text-sm font-medium text-[#0F6B3E]">
                #{topic}
              </div>

              <input
                placeholder="Add more keywords..."
                className="flex-1 min-w-[200px] border-none outline-none text-sm bg-gray-50 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#0F6B3E]/20 transition"
                value={additionalKeywords}
                onChange={(e) => setAdditionalKeywords(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />

              <select 
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="border border-gray-200 px-3 py-2 rounded-xl text-sm bg-white hover:bg-gray-50 transition"
              >
                <option>AND</option>
                <option>OR</option>
              </select>

              <button 
                onClick={handleSearch}
                disabled={!additionalKeywords}
                className="bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] hover:from-[#0c5a34] hover:to-[#238b5a] text-white px-5 py-2 rounded-xl font-medium text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>

              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm hover:bg-gray-50 transition"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>

              <button 
                onClick={handleApplyPrevious}
                className="flex items-center gap-2 text-[#0F6B3E] text-sm hover:text-[#0c5a34] transition"
              >
                <RefreshCw size={16} />
                Apply Previous
              </button>
            </div>

            {/* Filters Panel */}
            {filterOpen && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-2">Min Followers</label>
                  <input 
                    type="number" 
                    placeholder="1000" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0F6B3E]/20 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-2">Max Budget</label>
                  <input 
                    type="number" 
                    placeholder="5000" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0F6B3E]/20 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-2">Min Engagement Rate</label>
                  <input 
                    type="number" 
                    placeholder="2%" 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0F6B3E]/20 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{creators.length}</span> creators 
            {!loading && creators.length > 0 && ` out of ${Math.floor(Math.random() * 50000 + 10000).toLocaleString()} results`}
          </span>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={excludeSaved}
                onChange={(e) => setExcludeSaved(e.target.checked)}
                className="rounded border-gray-300 text-[#0F6B3E] focus:ring-[#0F6B3E]"
              />
              Exclude Saved
            </label>

            <button className="bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] text-white px-5 py-2 rounded-xl font-medium text-sm hover:shadow-md transition">
              + Add to List
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#0F6B3E] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 font-medium">Finding creators talking about #{topic}...</p>
            <p className="text-sm text-gray-400">Scanning {platform}</p>
          </div>
        )}

        {/* Results Table */}
        {!loading && creators.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">Creator</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Username</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Followers</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Eng Rate</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Growth</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Est Fee</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator, index) => (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                          />
                          <span className="font-medium text-gray-900">{creator.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">@{creator.username}</td>
                      <td className="p-4 font-semibold text-gray-800">{creator.followers}</td>
                      <td className="p-4">
                        <span className="text-green-600 font-medium">{creator.engagement}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-blue-600">{creator.growth}</span>
                      </td>
                      <td className="p-4 font-semibold text-[#0F6B3E]">{creator.fee}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#0F6B3E] transition">
                            View
                          </button>
                          <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] text-white rounded-xl hover:shadow-md transition">
                            Add
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && creators.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No creators found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any creators talking about "{topic}" on {platform}
            </p>
            <button
              onClick={handleBackToSearch}
              className="px-6 py-3 bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] text-white rounded-xl hover:shadow-lg transition"
            >
              Try Another Search
            </button>
          </div>
        )}

        {/* Footer Stats */}
        {!loading && creators.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
            <span>Showing 1-{creators.length} of {Math.floor(Math.random() * 50000 + 10000).toLocaleString()} creators</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Previous</button>
              <button className="px-3 py-1 bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">2</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">3</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}