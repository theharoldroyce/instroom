"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, X, Bookmark, Eye, ExternalLink, Loader2, CheckCircle2, AlertCircle, Search, RefreshCw } from "lucide-react"

type Creator = {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followers: string
  followersRaw: number
  engagement: string
  growth: string
  fee: string
  platform: string
  avgLikes: string
  avgComments: string
  totalPosts: string
  category: string
  location: string
  website: string
  email: string
  profileUrl: string
}

// Rate limiting helper
class RateLimiter {
  private queue: (() => Promise<void>)[] = []
  private processing = false
  private lastRequestTime = 0
  private minDelay = 500 // 500ms between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest))
      }

      const fn = this.queue.shift()
      if (fn) {
        this.lastRequestTime = Date.now()
        await fn()
      }
    }

    this.processing = false
  }
}

const rateLimiter = new RateLimiter()

export default function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Handle both topic and username parameters
  const topic = searchParams.get("topic")
  const username = searchParams.get("username")
  const platform = searchParams.get("platform") || "Instagram"

  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [additionalKeywords, setAdditionalKeywords] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [excludeSaved, setExcludeSaved] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState("AND")
  
  // Filter states
  const [minFollowers, setMinFollowers] = useState("")
  const [maxBudget, setMaxBudget] = useState("")
  const [minEngagement, setMinEngagement] = useState("")
  
  // Saved creators state (localStorage)
  const [savedCreators, setSavedCreators] = useState<Set<string>>(new Set())
  
  // Peek sidebar state
  const [peekCreator, setPeekCreator] = useState<Creator | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Add Influencer modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addMode, setAddMode] = useState<"single" | "bulk">("single")
  const [singleUsername, setSingleUsername] = useState("")
  const [bulkUsernames, setBulkUsernames] = useState("")
  const [addingInfluencer, setAddingInfluencer] = useState(false)
  const [addStatus, setAddStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" })
  const [addedCreators, setAddedCreators] = useState<Creator[]>([])
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Load saved creators from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("savedCreators")
    if (saved) {
      try {
        setSavedCreators(new Set(JSON.parse(saved)))
      } catch (e) {
        console.error("Error loading saved creators:", e)
      }
    }
  }, [])

  // Save to localStorage when savedCreators changes
  useEffect(() => {
    localStorage.setItem("savedCreators", JSON.stringify(Array.from(savedCreators)))
  }, [savedCreators])

  const toggleSave = (username: string) => {
    setSavedCreators(prev => {
      const next = new Set(prev)
      if (next.has(username)) {
        next.delete(username)
      } else {
        next.add(username)
      }
      return next
    })
  }

  const formatNumber = (num: number): string => {
    if (!num || isNaN(num)) return "0"
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  const estimateFee = (followers: number, engagement: number): string => {
    if (!followers || isNaN(followers)) followers = 0
    if (!engagement || isNaN(engagement)) engagement = 0
    const baseRate = followers * 0.02 + engagement * 100
    return "$" + Math.round(baseRate).toLocaleString()
  }

  const fetchCreatorFromAPI = async (username: string, platformType: string): Promise<Creator | null> => {
    try {
      const cleanUsername = username.trim().replace("@", "").toLowerCase()
      
      const apiUrl = platformType.toLowerCase() === "tiktok"
        ? `https://api.instroom.io/${cleanUsername}/tiktok`
        : `https://api.instroom.io/v2/${cleanUsername}/instagram`
      
      const response = await rateLimiter.add(() => fetch(apiUrl))
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Creator not found: ${cleanUsername}`)
          return null
        }
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        console.warn(`Invalid data for ${cleanUsername}`)
        return null
      }
      
      // Safely extract values with fallbacks
      const followersCount = Number(data.follower_count || data.followers || 0)
      const avgLikesCount = Number(data.avg_likes || data.averageLikes || 0)
      const avgCommentsCount = Number(data.avg_comments || data.averageComments || 0)
      const totalPostsCount = Number(data.media_count || data.total_posts || 0)
      const growthRateValue = Number(data.growth_rate || data.growth || 0)
      
      // Calculate engagement rate safely
      let engagementRate = 0
      if (followersCount > 0) {
        const calculatedRate = ((avgLikesCount + avgCommentsCount) / followersCount) * 100
        engagementRate = isNaN(calculatedRate) || !isFinite(calculatedRate) ? 0 : calculatedRate
      }
      
      return {
        id: data.id || `${platformType}-${cleanUsername}-${Date.now()}`,
        name: data.full_name || data.name || cleanUsername,
        username: data.username || cleanUsername,
        avatar: data.profile_pic_url || data.avatar || `https://ui-avatars.com/api/?name=${cleanUsername}&background=0F6B3E&color=fff`,
        bio: data.biography || data.bio || "",
        followers: formatNumber(followersCount),
        followersRaw: followersCount,
        engagement: engagementRate.toFixed(2) + "%",
        growth: growthRateValue > 0 ? growthRateValue.toFixed(1) + "%" : "N/A",
        fee: estimateFee(followersCount, engagementRate),
        platform: platformType,
        avgLikes: formatNumber(avgLikesCount),
        avgComments: formatNumber(avgCommentsCount),
        totalPosts: formatNumber(totalPostsCount),
        category: data.category || data.business_category || "Creator",
        location: data.location || data.city || "",
        website: data.external_url || data.website || "",
        email: data.business_email || data.email || "",
        profileUrl: data.profile_url || `https://${platformType.toLowerCase()}.com/${cleanUsername}`
      }
    } catch (error) {
      console.error(`Error fetching ${username}:`, error)
      return null
    }
  }

  // Fetch single creator by username
  const fetchSingleCreator = useCallback(async (searchUsername: string) => {
    setSearching(true)
    setSearchError(null)
    
    try {
      const creator = await fetchCreatorFromAPI(searchUsername, platform)
      
      if (creator) {
        setCreators([creator])
      } else {
        setCreators([])
        setSearchError(`No creator found with username "${searchUsername}" on ${platform}`)
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchError("Failed to fetch creator. Please try again.")
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }, [platform])

  // Search for creators based on topic (for topic-based searches)
  const searchCreatorsByTopic = useCallback(async (searchTopic: string) => {
    setSearching(true)
    setSearchError(null)
    
    try {
      const topicKeywords = searchTopic.toLowerCase().split(/\s+/)
      
      const topicUsernameMap: Record<string, string[]> = {
        'fitness': ['kayla_itsines', 'jenselter', 'simeonpanda', 'michelle_lewin', 'bretcontreras1'],
        'beauty': ['hudabeauty', 'jamescharles', 'patrickstarrr', 'nikkietutorials', 'mannymua733'],
        'tech': ['marquesbrownlee', 'unboxtherapy', 'mkbhd', 'ijustine', 'austinnotduncan'],
        'travel': ['muradosmann', 'chrisburkard', 'tuulavintage', 'expertvagabond', 'theblondeabroad'],
        'food': ['gordongram', 'jamieoliver', 'marthastewart', 'buzzfeedtasty', 'thefoodbabe'],
        'fashion': ['chiaraferragni', 'songofstyle', 'manrepeller', 'weworewhat', 'somethingnavy'],
        'gaming': ['ninja', 'pokimanelol', 'shroud', 'drdisrespect', 'summit1g'],
      }
      
      let searchUsernames: string[] = []
      for (const [key, usernames] of Object.entries(topicUsernameMap)) {
        if (topicKeywords.some(keyword => key.includes(keyword) || keyword.includes(key))) {
          searchUsernames = [...searchUsernames, ...usernames]
        }
      }
      
      if (searchUsernames.length === 0) {
        searchUsernames = ["cristiano", "leomessi", "selenagomez", "kyliejenner", "kimkardashian"]
      }
      
      searchUsernames = [...new Set(searchUsernames)]
      
      const fetchedCreators: Creator[] = []
      
      for (const username of searchUsernames) {
        const creator = await fetchCreatorFromAPI(username, platform)
        if (creator) {
          fetchedCreators.push(creator)
        }
      }
      
      setCreators(fetchedCreators)
      
      if (fetchedCreators.length === 0) {
        setSearchError(`No creators found for "${searchTopic}" on ${platform}`)
      }
      
    } catch (error) {
      console.error("Search error:", error)
      setSearchError("Failed to search for creators. Please try again.")
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }, [platform])

  // Load initial data based on URL parameters
  useEffect(() => {
    setLoading(true)
    
    // Prioritize username search over topic search
    if (username) {
      fetchSingleCreator(username)
    } else if (topic) {
      searchCreatorsByTopic(topic)
    } else {
      setLoading(false)
    }
  }, [username, topic, platform, fetchSingleCreator, searchCreatorsByTopic])

  const handleAddSingleInfluencer = async () => {
    if (!singleUsername.trim()) return
    
    setAddingInfluencer(true)
    setAddStatus({ type: null, message: "" })
    
    const username = singleUsername.trim().replace("@", "")
    const creator = await fetchCreatorFromAPI(username, platform)
    
    if (creator) {
      setCreators(prev => {
        const exists = prev.some(c => c.username.toLowerCase() === creator.username.toLowerCase())
        if (exists) {
          setAddStatus({ type: "error", message: `@${creator.username} is already in the list` })
          return prev
        }
        return [creator, ...prev]
      })
      setAddedCreators(prev => {
        const exists = prev.some(c => c.username.toLowerCase() === creator.username.toLowerCase())
        if (exists) return prev
        return [creator, ...prev]
      })
      setAddStatus({ type: "success", message: `@${creator.username} added successfully!` })
      setSingleUsername("")
    } else {
      setAddStatus({ type: "error", message: `Could not find @${username} on ${platform}. Please check the username and try again.` })
    }
    
    setAddingInfluencer(false)
  }

  const handleAddBulkInfluencers = async () => {
    if (!bulkUsernames.trim()) return
    
    setAddingInfluencer(true)
    setAddStatus({ type: null, message: "" })
    
    const usernames = bulkUsernames
      .split(/[,\n]+/)
      .map(u => u.trim().replace("@", ""))
      .filter(u => u.length > 0)
    
    const uniqueUsernames = [...new Set(usernames)]
    
    const newCreators: Creator[] = []
    const errors: string[] = []
    const duplicates: string[] = []
    
    let processed = 0
    
    for (const username of uniqueUsernames) {
      processed++
      setAddStatus({ 
        type: "success", 
        message: `Processing ${processed}/${uniqueUsernames.length}: @${username}...` 
      })
      
      const creator = await fetchCreatorFromAPI(username, platform)
      if (creator) {
        const existsInCurrent = creators.some(c => c.username.toLowerCase() === creator.username.toLowerCase())
        const existsInNew = newCreators.some(c => c.username.toLowerCase() === creator.username.toLowerCase())
        
        if (!existsInCurrent && !existsInNew) {
          newCreators.push(creator)
        } else {
          duplicates.push(creator.username)
        }
      } else {
        errors.push(username)
      }
    }
    
    if (newCreators.length > 0) {
      setCreators(prev => [...newCreators, ...prev])
      setAddedCreators(prev => [...newCreators, ...prev])
    }
    
    let message = ""
    if (newCreators.length > 0) {
      message += `Successfully added ${newCreators.length} creator(s). `
    }
    if (duplicates.length > 0) {
      message += `${duplicates.length} already in list. `
    }
    if (errors.length > 0) {
      message += `Failed to fetch: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? ` and ${errors.length - 3} more` : ""}`
    }
    
    setAddStatus({ 
      type: newCreators.length > 0 ? "success" : "error", 
      message: message || "No creators were added" 
    })
    
    if (newCreators.length > 0) {
      setBulkUsernames("")
    }
    
    setAddingInfluencer(false)
  }

  const openPeek = (creator: Creator) => {
    setPeekCreator(creator)
    setSidebarOpen(true)
  }

  const openProfile = (profileUrl: string) => {
    window.open(profileUrl, "_blank")
  }

  const getPlatformIcon = () => {
    switch(platform) {
      case "TikTok": return "🎵"
      case "YouTube": return "▶️"
      default: return "📷"
    }
  }

  const handleSearch = () => {
    if (additionalKeywords) {
      const combinedTopic = selectedOperator === "AND"
        ? `${topic} ${additionalKeywords}`
        : `${topic} OR ${additionalKeywords}`

      router.push(`/dashboard/influencer-discovery/search?topic=${encodeURIComponent(
        combinedTopic
      )}&platform=${encodeURIComponent(platform)}`)
    }
  }

  const handleBackToSearch = () => {
    router.push("/dashboard/influencer-discovery")
  }

  // Apply filters
  const filteredCreators = creators.filter(creator => {
    if (excludeSaved && savedCreators.has(creator.username)) {
      return false
    }
    
    if (minFollowers && creator.followersRaw < parseInt(minFollowers)) {
      return false
    }
    
    if (maxBudget) {
      const feeValue = parseInt(creator.fee.replace(/[$,]/g, ""))
      if (feeValue > parseInt(maxBudget)) {
        return false
      }
    }
    
    if (minEngagement) {
      const engagementValue = parseFloat(creator.engagement.replace("%", ""))
      if (engagementValue < parseFloat(minEngagement)) {
        return false
      }
    }
    
    return true
  })

  const sortedCreators = [...filteredCreators].sort((a, b) => b.followersRaw - a.followersRaw)

  // Determine display title
  const displayTitle = username || topic

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
            {username ? (
              <>Results for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E]">@{displayTitle}</span></>
            ) : (
              <>Results for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E]">#{displayTitle}</span></>
            )}
          </h1>
          <p className="text-gray-600">
            Platform: <span className="font-medium">{platform}</span>
          </p>
        </div>

        {/* Search Bar UI - Only show for topic searches */}
        {topic && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-6 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl">{getPlatformIcon()}</span>
                <span className="text-sm text-gray-600">Show influencers who talk about</span>
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
                  {(minFollowers || maxBudget || minEngagement) && (
                    <span className="ml-1 w-2 h-2 bg-[#0F6B3E] rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => topic && searchCreatorsByTopic(topic)}
                  disabled={searching}
                  className="border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm hover:bg-gray-50 transition disabled:opacity-50"
                  title="Refresh results"
                >
                  <RefreshCw size={16} className={searching ? "animate-spin" : ""} />
                </button>
              </div>

              {filterOpen && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-2">Min Followers</label>
                    <input 
                      type="number" 
                      placeholder="1000" 
                      value={minFollowers}
                      onChange={(e) => setMinFollowers(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0F6B3E]/20 focus:border-transparent outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-2">Max Budget ($)</label>
                    <input 
                      type="number" 
                      placeholder="5000" 
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0F6B3E]/20 focus:border-transparent outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-2">Min Engagement Rate (%)</label>
                    <input 
                      type="number" 
                      placeholder="2" 
                      step="0.1"
                      value={minEngagement}
                      onChange={(e) => setMinEngagement(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#0F6B3E]/20 focus:border-transparent outline-none" 
                    />
                  </div>
                  {(minFollowers || maxBudget || minEngagement) && (
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        onClick={() => {
                          setMinFollowers("")
                          setMaxBudget("")
                          setMinEngagement("")
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{sortedCreators.length}</span> creators
              {creators.length > 0 && sortedCreators.length !== creators.length && (
                <span className="text-gray-400"> (filtered from {creators.length})</span>
              )}
            </span>
            {searchError && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {searchError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeSaved}
                onChange={(e) => setExcludeSaved(e.target.checked)}
                className="rounded border-gray-300 text-[#0F6B3E] focus:ring-[#0F6B3E]"
              />
              Exclude Saved ({savedCreators.size})
            </label>
            <button 
              onClick={() => setAddModalOpen(true)}
              className="bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] text-white px-5 py-2 rounded-xl font-medium text-sm hover:shadow-md transition flex items-center gap-2"
            >
              <span>+</span> Add Influencer
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(loading || searching) && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#0F6B3E] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 font-medium">
              {searching ? "Searching for creators..." : username ? `Fetching @${username}'s profile...` : `Finding creators talking about #${topic}...`}
            </p>
            <p className="text-sm text-gray-400">Fetching data from {platform} API</p>
          </div>
        )}

        {/* Results Table */}
        {!loading && !searching && sortedCreators.length > 0 && (
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
                  {sortedCreators.map((creator) => (
                    <tr key={creator.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${creator.username}&background=0F6B3E&color=fff`
                            }}
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
                          {/* Bookmark button */}
                          <button
                            onClick={() => toggleSave(creator.username)}
                            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition group"
                            title={savedCreators.has(creator.username) ? "Unsave" : "Save"}
                          >
                            <Bookmark 
                              size={18} 
                              className={savedCreators.has(creator.username) 
                                ? "fill-[#0F6B3E] text-[#0F6B3E]" 
                                : "text-gray-400 group-hover:text-[#0F6B3E]"
                              } 
                            />
                          </button>
                          
                          {/* Peek button */}
                          <button
                            onClick={() => openPeek(creator)}
                            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition group"
                            title="Quick peek"
                          >
                            <Eye size={18} className="text-gray-400 group-hover:text-[#0F6B3E]" />
                          </button>
                          
                          {/* View profile button */}
                          <button
                            onClick={() => openProfile(creator.profileUrl)}
                            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition group"
                            title="View profile"
                          >
                            <ExternalLink size={18} className="text-gray-400 group-hover:text-[#0F6B3E]" />
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
        {!loading && !searching && sortedCreators.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No creators found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchError || (username ? `We couldn't find @${username} on ${platform}` : `We couldn't find any creators talking about "${topic}" on ${platform}`)}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleBackToSearch}
                className="px-6 py-3 bg-gradient-to-r from-[#0F6B3E] to-[#2A9D6E] text-white rounded-xl hover:shadow-lg transition"
              >
                Try Another Search
              </button>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-6 py-3 border border-[#0F6B3E] text-[#0F6B3E] rounded-xl hover:bg-[#0F6B3E]/5 transition"
              >
                Add Manually
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Peek Sidebar - Keep the same */}
      {/* ... rest of your sidebar and modal code remains the same ... */}
      
      {/* Peek Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ... sidebar content ... */}
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add Influencer Modal */}
      {/* ... modal content ... */}
    </div>
  )
}