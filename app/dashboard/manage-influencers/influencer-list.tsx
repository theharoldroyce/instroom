"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  IconSearch,
  IconTrash,
  IconLayoutKanban
} from "@tabler/icons-react"

import AddInfluencerModal from "./modal/AddInfluencerModal"
import AddManualInfluencer from "./modal/AddManualInfluencer"
import AddInstagramInfluencer from "./modal/AddInstagramInfluencer"
import AddTiktokCreator from "./modal/AddTiktokCreator"
import InfluencerProfile from "./modal/InfluencerProfile"
import ImportInfluencerList from "./modal/ImportInfluencerList"

// Import the JSON data
import jsonData from "@/app/dashboard/data.json"

export default function InfluencerList() {

  const [view, setView] = useState<"table" | "kanban">("table")
  const [profile, setProfile] = useState<any>(null)
  const [influencers, setInfluencers] = useState<any[]>([])

  const [openModal, setOpenModal] = useState(false)
  const [openImport, setOpenImport] = useState(false)

  const [modalType, setModalType] = useState<
    "select" | "manual" | "instagram" | "tiktok"
  >("select")

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Load data from JSON file on component mount
  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      setInfluencers(jsonData)
    }
  }, [])

  // Function to delete an influencer
  const deleteInfluencer = (id: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click from triggering
    setInfluencers(prev => prev.filter(item => item.id !== id))
  }

  // Function to add a new influencer
  const addInfluencer = (newInfluencer: any) => {
    const newId = influencers.length > 0 ? Math.max(...influencers.map(i => i.id)) + 1 : 1
    setInfluencers(prev => [...prev, { ...newInfluencer, id: newId }])
  }

  // Map pipeline status to display status
  const getDisplayStatus = (pipelineStatus: string) => {
    switch(pipelineStatus) {
      case "Onboarded":
        return "Active"
      case "In Conversation":
        return "Negotiation"
      case "Reached Out":
        return "For Outreach"
      case "Prospect":
        return "For Outreach"
      case "Rejected":
        return "Closed"
      default:
        return pipelineStatus || "For Outreach"
    }
  }

  // Get status color class
  const getStatusColor = (status: string) => {
    switch(status) {
      case "For Outreach":
        return "bg-[#1FAE5B]/15 text-[#0F6B3E]"
      case "Negotiation":
        return "bg-blue-100 text-blue-700"
      case "Active":
        return "bg-green-100 text-green-700"
      case "Closed":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // pagination logic
  const indexOfLast = currentPage * rowsPerPage
  const indexOfFirst = indexOfLast - rowsPerPage
  const currentRows = influencers.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(influencers.length / rowsPerPage)

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing rows per page
  }

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [influencers.length])

  // Handle checkbox click to prevent row click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Handle dropdown click to prevent row click
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="relative">

      <div className="p-6 flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-6 flex-wrap">

          <div className="flex-1 min-w-[320px] max-w-[650px] relative">

            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              placeholder="Search influencer"
              className="pl-9 h-10 w-full"
            />

          </div>

          <div className="flex gap-2 flex-wrap">

            <button
              onClick={() => {
                setModalType("select")
                setOpenModal(true)
              }}
              className="bg-[#1FAE5B] text-white px-4 py-2 rounded-lg text-sm"
            >
              + New Influencer
            </button>

            <button
              onClick={() => setOpenImport(true)}
              className="h-10 px-4 border rounded-lg text-sm"
            >
              Import
            </button>

            <button className="h-10 px-4 border rounded-lg text-sm">
              Export
            </button>

            <button className="h-10 px-4 border rounded-lg text-sm">
              Filter
            </button>

          </div>

        </div>

        {/* ACTION BAR */}
        <div className="flex justify-end items-center gap-2">

          <button
            onClick={() =>
              setView(view === "table" ? "kanban" : "table")
            }
            className="h-9 w-9 flex items-center justify-center 
                       border border-gray-300 rounded-md
                       hover:bg-gray-100 transition"
          >
            <IconLayoutKanban size={18} />
          </button>

          <button
            className="h-9 px-3 flex items-center
                       border border-[#0F6B3E]/20
                       rounded-md text-sm
                       hover:bg-[#0F6B3E]/10 transition"
          >
            Add to Pipeline
          </button>

          <button
            className="h-9 px-3 flex items-center
                       border border-red-300
                       rounded-md text-sm text-red-500
                       hover:bg-red-50 transition"
          >
            Remove
          </button>

        </div>

{/* TABLE VIEW */}
{view === "table" && (

  <div className="border rounded-xl overflow-auto">

    <table className="min-w-[2100px] w-full text-sm">

      <thead className="border-b bg-gray-50">
        <tr>
          <th className="px-3 py-2 w-12">#</th>
          <th className="px-3 py-2 w-10">✓</th>
          <th className="px-3 py-2">Profile</th>
          
          {/* About Influencer Section */}
          <th colSpan={7} className="px-3 py-2 text-center bg-gray-100 border-x">
            About Influencer
          </th>
          
          {/* Outreach Info Section */}
          <th colSpan={8} className="px-3 py-2 text-center bg-gray-100">
            Outreach Info
          </th>
          <th className="px-3 py-2">Action</th>
        </tr>
        <tr className="border-b">
          <th className="px-3 py-2 w-12"></th>
          <th className="px-3 py-2 w-10"></th>
          <th className="px-3 py-2"></th>
          
          {/* About Influencer Sub-headers */}
          <th className="px-3 py-2">Username Handle</th>
          <th className="px-3 py-2">Niche</th>
          <th className="px-3 py-2">Gender</th>
          <th className="px-3 py-2">Location</th>
          <th className="px-3 py-2">Follower Count</th>
          <th className="px-3 py-2">Engagement Rate (%)</th>
          <th className="px-3 py-2">Social Link</th>
          
          {/* Outreach Info Sub-headers */}
          <th className="px-3 py-2">First Name</th>
          <th className="px-3 py-2">Contact Info</th>
          <th className="px-3 py-2">Sourced Date</th>
          <th className="px-3 py-2">Sourced By</th>
          <th className="px-3 py-2">Service Duplicate IG</th>
          <th className="px-3 py-2">Approve / Decline</th>
          <th className="px-3 py-2">Transferred Date</th>
          <th className="px-3 py-2">Notes</th>
          <th className="px-3 py-2"></th>
        </tr>
      </thead>

      <tbody>

        {currentRows.map((item, idx) => {
          const rowNumber = indexOfFirst + idx + 1
          return (
            <tr 
              key={item.id} 
              className="border-t hover:bg-gray-50 cursor-pointer"
              onClick={() => setProfile(item)}
            >
              <td className="px-3 py-2 text-center text-gray-500 text-xs">
                {rowNumber}
              </td>
              <td className="px-3 py-2" onClick={handleCheckboxClick}>
                <input type="checkbox" onClick={handleCheckboxClick} />
              </td>

              <td className="px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {item.firstName?.charAt(0) || item.influencer?.charAt(0) || "?"}
                  </span>
                </div>
              </td>

              {/* About Influencer Data */}
              <td className="px-3 py-2 text-[#0F6B3E] font-medium">
                {item.instagramHandle || "-"}
              </td>
              <td className="px-3 py-2">{item.niche || "-"}</td>
              <td className="px-3 py-2">{item.gender || "-"}</td>
              <td className="px-3 py-2">{item.location || "-"}</td>
              <td className="px-3 py-2">{item.followers || "-"}</td>
              <td className="px-3 py-2">{item.engagementRate || "-"}%</td>
              <td className="px-3 py-2" onClick={handleDropdownClick}>
                {item.socialLink ? (
                  <a href={item.socialLink} target="_blank" className="text-blue-600" onClick={(e) => e.stopPropagation()}>
                    Link
                  </a>
                ) : "-"}
              </td>

              {/* Outreach Info Data */}
              <td className="px-3 py-2">{item.firstName || item.influencer || "-"}</td>
              <td className="px-3 py-2">{item.contactInfo || item.email || "-"}</td>
              <td className="px-3 py-2">{item.sourcedDate || "-"}</td>
              <td className="px-3 py-2">{item.sourcedBy || "-"}</td>
              <td className="px-3 py-2">{item.duplicateIG || "-"}</td>
              
              <td className="px-3 py-2" onClick={handleDropdownClick}>
                <select
                  value={item.approval || ""}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setInfluencers(prev => prev.map(i => 
                      i.id === item.id ? { ...i, approval: newValue } : i
                    ))
                  }}
                  onClick={handleDropdownClick}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="">Select</option>
                  <option value="Approve">Approve</option>
                  <option value="Decline">Decline</option>
                </select>
              </td>

              <td className="px-3 py-2">{item.transferredDate || "-"}</td>
              <td className="px-3 py-2">{item.notes || "-"}</td>

              <td className="px-3 py-2" onClick={handleDropdownClick}>
                <button
                  onClick={(e) => deleteInfluencer(item.id, e)}
                  className="text-red-500 hover:text-red-700"
                >
                  <IconTrash size={16} />
                </button>
              </td>

            </tr>
          )
        })}

        {currentRows.length === 0 && (
          <tr>
            <td colSpan={20} className="text-center py-8 text-gray-500">
              No influencers found
            </td>
          </tr>
        )}

      </tbody>

    </table>

  </div>

)}

        {/* PAGINATION (BOTTOM) */}
        {view === "table" && influencers.length > 0 && (
          <div className="flex justify-between items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border rounded px-2 py-1 bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-600">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, influencers.length)} of {influencers.length} entries
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`border px-3 py-1 rounded transition ${
                    currentPage === 1 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Prev
                </button>
                
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`border px-3 py-1 rounded transition ${
                    currentPage === totalPages 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KANBAN VIEW */}
        {view === "kanban" && (
          <div className="grid grid-cols-4 gap-4">
            {["For Outreach", "Negotiation", "Active", "Closed"].map(stage => {
              // Filter influencers that match this stage
              const stageInfluencers = influencers.filter(item => {
                const displayStatus = getDisplayStatus(item.pipelineStatus)
                return displayStatus === stage
              })

              return (
                <div key={stage} className="bg-gray-50 rounded-xl p-4">

                  <h3 className="text-sm font-semibold mb-3">
                    {stage} ({stageInfluencers.length})
                  </h3>

                  <div className="flex flex-col gap-3">

                    {stageInfluencers.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                        onClick={() => setProfile(item)}
                      >

                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {item.influencer?.charAt(0) || item.firstName?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.influencer || item.firstName}</p>
                            <p className="text-xs text-gray-500">{item.instagramHandle}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>📊 {item.followers}</span>
                          <span>💬 {item.engagementRate}</span>
                        </div>

                        <div className="text-xs text-gray-400">
                          🏷️ {item.niche}
                        </div>

                      </div>
                    ))}

                    {stageInfluencers.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No influencers in {stage}
                      </div>
                    )}

                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* PROFILE MODAL */}
      {profile && (
        <InfluencerProfile
          data={profile}
          close={() => setProfile(null)}
        />
      )}

      {/* ADD INFLUENCER MODALS */}
      {openModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[560px] rounded-2xl shadow-xl p-8">

            {modalType === "select" && (
              <AddInfluencerModal
                setType={setModalType}
                onClose={() => setOpenModal(false)}
              />
            )}

            {modalType === "manual" && (
              <AddManualInfluencer
                close={() => setModalType("select")}
                onAdd={addInfluencer}
              />
            )}

            {modalType === "instagram" && (
              <AddInstagramInfluencer
                close={() => setModalType("select")}
                onAdd={addInfluencer}
              />
            )}

            {modalType === "tiktok" && (
              <AddTiktokCreator
                close={() => setModalType("select")}
                onAdd={addInfluencer}
              />
            )}

          </div>

        </div>

      )}

      {/* IMPORT MODAL */}
      {openImport && (
        <ImportInfluencerList 
          close={() => setOpenImport(false)} 
          onImport={setInfluencers}
        />
      )}

    </div>
  )
}