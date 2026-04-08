"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"

const recommendedSearches = [
  "#EcoFriendlyLiving",
  "#MinimalistStyle",
  "#WellnessJourney",
  "#HandmadeWithLove",
]

function InfluencerDiscoveryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [brandId, setBrandId] = useState<string | null>(null)

  const [topic, setTopic] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram")
  const [openPlatform, setOpenPlatform] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load recent searches", e)
      }
    }
  }, [])

  // Watch for brand changes
  useEffect(() => {
    const id = searchParams.get("brandId")
    setBrandId(id)
  }, [searchParams])

  // Save recent search
  const saveRecentSearch = (searchTerm: string) => {
    const cleanTerm = searchTerm.replace("#", "")
    setRecentSearches((prev) => {
      const updated = [cleanTerm, ...prev.filter((s) => s !== cleanTerm)].slice(0, 5)
      localStorage.setItem("recentSearches", JSON.stringify(updated))
      return updated
    })
  }

  const searchCreators = () => {
    if (!topic.trim()) return

    const cleanTopic = topic.replace("#", "")
    saveRecentSearch(cleanTopic)

    const params = new URLSearchParams()
    params.set("topic", cleanTopic)
    params.set("platform", selectedPlatform)
    if (brandId) params.set("brandId", brandId)

    router.push(
      `/dashboard/influencer-discovery/search?${params.toString()}`
    )
  }

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace("#", "")
    saveRecentSearch(cleanTag)

    const params = new URLSearchParams()
    params.set("topic", cleanTag)
    params.set("platform", selectedPlatform)
    if (brandId) params.set("brandId", brandId)

    router.push(
      `/dashboard/influencer-discovery/search?${params.toString()}`
    )
  }

  const handleRecentSearchClick = (search: string) => {
    setTopic(search)
    saveRecentSearch(search)
    
    const params = new URLSearchParams()
    params.set("topic", search)
    params.set("platform", selectedPlatform)
    if (brandId) params.set("brandId", brandId)

    router.push(
      `/dashboard/influencer-discovery/search?${params.toString()}`
    )
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && topic.trim()) {
      searchCreators()
    }
  }

  const platforms = [
    {
      name: "Instagram",
      icon: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
        alt="Instagram"
        className="w-6 h-6"
      />
      ),
    },
    {
      name: "TikTok",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.89 2.89 2.896 2.896 0 0 1-2.889-2.89 2.896 2.896 0 0 1 2.89-2.889c.302 0 .595.05.872.137V9.257a6.339 6.339 0 0 0-5.053 2.212 6.339 6.339 0 0 0-1.33 5.52 6.34 6.34 0 0 0 5.766 4.731 6.34 6.34 0 0 0 6.34-6.34V8.898a7.756 7.756 0 0 0 4.422 1.393V6.825a4.8 4.8 0 0 1-2.443-.139z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ]

  const currentPlatform = platforms.find(
    (p) => p.name === selectedPlatform
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenPlatform(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9F8] via-white to-[#F7F9F8]">
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Find creators who
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E]">
              influence your customers
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with authentic voices that resonate with your brand
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
            <div className="p-2">

              <div className="flex flex-col sm:flex-row gap-2">

                {/* Platform Selector */}
                <div ref={dropdownRef} className="relative z-10">

                  <button
                    type="button"
                    onClick={() => setOpenPlatform((prev) => !prev)}
                    className="bg-gray-50 hover:bg-gray-100 rounded-xl px-5 py-4 flex items-center justify-center gap-2 transition-colors"
                  >
                    <div className={`${
                      selectedPlatform === "Instagram" ? "text-[#E4405F]" : 
                      selectedPlatform === "TikTok" ? "text-black" : 
                      "text-[#FF0000]"
                    }`}>
                      {currentPlatform?.icon}
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`transition-transform duration-200 ${openPlatform ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {openPlatform && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenPlatform(false)}
                      />
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 mt-2 w-auto min-w-[60px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        {platforms.map((platform) => (
                          <button
                            key={platform.name}
                            type="button"
                            onClick={() => {
                              setSelectedPlatform(platform.name)
                              setOpenPlatform(false)
                            }}
                            className={`w-full flex items-center justify-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                              selectedPlatform === platform.name ? 'bg-green-50' : ''
                            }`}
                            title={platform.name}
                          >
                            <div className={`${
                              platform.name === "Instagram" ? "text-[#E4405F]" : 
                              platform.name === "TikTok" ? "text-black" : 
                              "text-[#FF0000]"
                            }`}>
                              {platform.icon}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                </div>

                {/* Topic Input */}
                <div className="flex-1 relative">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Search by topic on ${selectedPlatform}...`}
                    className="w-full px-4 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F6B3E]/20"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={searchCreators}
                  disabled={!topic.trim()}
                  className="bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] text-white font-semibold px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  Find Creators
                </button>

              </div>

            </div>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Searches */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">Recommended Searches</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {recommendedSearches.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-6 py-2.5 rounded-full bg-white border-2 border-gray-200 hover:border-[#0F6B3E] hover:text-[#0F6B3E] transition-all duration-200 hover:shadow-md"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default function InfluencerDiscoveryPage() {
  return (
    <Suspense>
      <InfluencerDiscoveryContent />
    </Suspense>
  )
}