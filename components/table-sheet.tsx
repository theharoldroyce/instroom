"use client"

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react"
import { IconTrash, IconPlus, IconCheck, IconX } from "@tabler/icons-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type InfluencerRow = {
  id: string
  // Influencer model (global / public)
  handle: string
  platform: string
  full_name: string
  email: string
  follower_count: string
  engagement_rate: string
  niche: string
  // BrandInfluencer model (brand-specific)
  contact_status: string
  stage: string
  outreach_method: string
  agreed_rate: string
  notes: string
  // BrandInfluencerCustomValue — keyed by field_key
  custom: Record<string, string>
}

export type CustomColumn = {
  id: string
  field_key: string   // maps to BrandCustomField.field_key
  field_name: string  // maps to BrandCustomField.field_name
  field_type: "text" | "number" | "select"
  field_options?: string[]
}

type CellAddress = { rowIdx: number; colIdx: number }

// ─── Static column definitions ────────────────────────────────────────────────

type ColDef = {
  key: string
  label: string
  group: "Influencer" | "Brand Details"
  minWidth: number
  type: "text" | "number" | "select"
  options?: string[]
  isCustom?: false
}

type CustomColDef = {
  key: string
  label: string
  group: "Brand Details"
  minWidth: number
  type: "text" | "number" | "select"
  options?: string[]
  isCustom: true
  customId: string
  fieldKey: string
}

type AnyColDef = ColDef | CustomColDef

const STATIC_COLS: ColDef[] = [
  // ── Influencer (global public data) ──────────────────────────────────────
  { key: "handle",          label: "Handle",        group: "Influencer",    minWidth: 140, type: "text" },
  { key: "platform",        label: "Platform",      group: "Influencer",    minWidth: 120, type: "select", options: ["instagram","tiktok","youtube","twitter","other"] },
  { key: "full_name",       label: "Full Name",     group: "Influencer",    minWidth: 150, type: "text" },
  { key: "email",           label: "Email",         group: "Influencer",    minWidth: 190, type: "text" },
  { key: "follower_count",  label: "Followers",     group: "Influencer",    minWidth: 110, type: "number" },
  { key: "engagement_rate", label: "Eng. Rate (%)", group: "Influencer",    minWidth: 125, type: "number" },
  { key: "niche",           label: "Niche",         group: "Influencer",    minWidth: 120, type: "text" },
  // ── BrandInfluencer (brand-specific data) ─────────────────────────────────
  { key: "contact_status",  label: "Status",        group: "Brand Details", minWidth: 135, type: "select", options: ["not_contacted","contacted","interested","agreed"] },
  { key: "stage",           label: "Stage",         group: "Brand Details", minWidth: 80,  type: "number" },
  { key: "outreach_method", label: "Outreach",      group: "Brand Details", minWidth: 120, type: "select", options: ["","email","dm","phone"] },
  { key: "agreed_rate",     label: "Rate ($)",      group: "Brand Details", minWidth: 100, type: "number" },
  { key: "notes",           label: "Notes",         group: "Brand Details", minWidth: 200, type: "text" },
]

const INFLUENCER_COL_COUNT = STATIC_COLS.filter((c) => c.group === "Influencer").length

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newEmptyRow(customCols: CustomColumn[]): InfluencerRow {
  const custom: Record<string, string> = {}
  customCols.forEach((c) => (custom[c.field_key] = ""))
  return {
    id: crypto.randomUUID(),
    handle: "", platform: "instagram", full_name: "", email: "",
    follower_count: "", engagement_rate: "", niche: "",
    contact_status: "not_contacted", stage: "1",
    outreach_method: "", agreed_rate: "", notes: "",
    custom,
  }
}

const STATUS_STYLE: Record<string, string> = {
  not_contacted: "bg-gray-100 text-gray-600",
  contacted:     "bg-blue-100 text-blue-700",
  interested:    "bg-yellow-100 text-yellow-700",
  agreed:        "bg-green-100 text-green-700",
}

function StatusBadge({ value }: { value: string }) {
  const cls = STATUS_STYLE[value] ?? "bg-gray-100 text-gray-500"
  return (
    <span className={`inline-block truncate max-w-full px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value || "—"}
    </span>
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ROWS: InfluencerRow[] = [
  { id: "mock-1", handle: "@prettyliv",    platform: "instagram", full_name: "Liv Santos",   email: "liv@example.com",   follower_count: "245000",  engagement_rate: "3.2", niche: "Beauty",  contact_status: "contacted",  stage: "2", outreach_method: "dm",    agreed_rate: "500",  notes: "Very responsive",         custom: {} },
  { id: "mock-2", handle: "@fitwithjay",   platform: "tiktok",    full_name: "Jay Kim",      email: "jay@example.com",   follower_count: "890000",  engagement_rate: "5.8", niche: "Fitness", contact_status: "interested", stage: "3", outreach_method: "email", agreed_rate: "1200", notes: "Discussing deliverables", custom: {} },
  { id: "mock-3", handle: "@travelwithmar",platform: "youtube",   full_name: "Marco Reyes",  email: "marco@example.com", follower_count: "1200000", engagement_rate: "2.1", niche: "Travel",  contact_status: "agreed",     stage: "4", outreach_method: "email", agreed_rate: "2500", notes: "Contract signed",         custom: {} },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface TableSheetProps {
  initialRows?: InfluencerRow[]
  initialCustomColumns?: CustomColumn[]
  onRowsChange?: (rows: InfluencerRow[]) => void
  onCustomColumnsChange?: (cols: CustomColumn[]) => void
  readOnly?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TableSheet({
  initialRows = MOCK_ROWS,
  initialCustomColumns = [],
  onRowsChange,
  onCustomColumnsChange,
  readOnly = false,
}: TableSheetProps) {
  const [rows, setRows] = useState<InfluencerRow[]>(initialRows)
  const [customCols, setCustomCols] = useState<CustomColumn[]>(initialCustomColumns)

  // Active / edit cell
  const [activeCell, setActiveCell] = useState<CellAddress | null>(null)
  const [editCell, setEditCell]     = useState<CellAddress | null>(null)
  const [editValue, setEditValue]   = useState("")

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Add-column panel
  const [addingCol, setAddingCol]   = useState(false)
  const [newColName, setNewColName] = useState("")

  const editInputRef   = useRef<HTMLInputElement | HTMLSelectElement | null>(null)
  const newColInputRef = useRef<HTMLInputElement>(null)
  const containerRef   = useRef<HTMLDivElement>(null)

  // ── Derived ───────────────────────────────────────────────────────────────

  const allCols: AnyColDef[] = [
    ...STATIC_COLS,
    ...customCols.map<CustomColDef>((c) => ({
      key: `custom.${c.field_key}`,
      label: c.field_name,
      group: "Brand Details",
      minWidth: 140,
      type: c.field_type,
      options: c.field_options,
      isCustom: true,
      customId: c.id,
      fieldKey: c.field_key,
    })),
  ]

  const totalCols    = allCols.length
  const totalRows    = rows.length
  const brandColCount = allCols.filter((c) => c.group === "Brand Details").length
  const totalPages   = Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const pageStart    = (currentPage - 1) * rowsPerPage
  const pageEnd      = Math.min(pageStart + rowsPerPage, totalRows)
  const pageRows     = rows.slice(pageStart, pageEnd)

  // Clamp page if rows are deleted
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(rows.length / rowsPerPage))
    if (currentPage > maxPage) setCurrentPage(maxPage)
  }, [rows.length, rowsPerPage, currentPage])

  // ── Cell value helpers ────────────────────────────────────────────────────

  const getCellValue = useCallback((row: InfluencerRow, colKey: string): string => {
    if (colKey.startsWith("custom.")) return row.custom[colKey.slice(7)] ?? ""
    return String((row as Record<string, unknown>)[colKey] ?? "")
  }, [])

  const applyCellValue = useCallback(
    (rowIdx: number, colKey: string, value: string) => {
      setRows((prev) => {
        const next = [...prev]
        const row = { ...next[rowIdx] }
        if (colKey.startsWith("custom.")) {
          row.custom = { ...row.custom, [colKey.slice(7)]: value }
        } else {
          ;(row as Record<string, unknown>)[colKey] = value
        }
        next[rowIdx] = row
        onRowsChange?.(next)
        return next
      })
    },
    [onRowsChange]
  )

  // ── Edit lifecycle ────────────────────────────────────────────────────────

  const startEdit = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (readOnly) return
      setActiveCell({ rowIdx, colIdx })
      setEditCell({ rowIdx, colIdx })
      setEditValue(getCellValue(rows[rowIdx], allCols[colIdx].key))
    },
    [allCols, getCellValue, readOnly, rows]
  )

  const commitEdit = useCallback(() => {
    if (!editCell) return
    applyCellValue(editCell.rowIdx, allCols[editCell.colIdx].key, editValue)
    setEditCell(null)
  }, [editCell, editValue, allCols, applyCellValue])

  const cancelEdit = useCallback(() => setEditCell(null), [])

  useEffect(() => {
    if (!editCell) return
    const el = editInputRef.current
    if (!el) return
    el.focus()
    if (el instanceof HTMLInputElement) el.select()
  }, [editCell])

  useEffect(() => {
    if (addingCol) newColInputRef.current?.focus()
  }, [addingCol])

  // ── Keyboard handlers ─────────────────────────────────────────────────────

  // Track whether Tab triggered the commit so onBlur doesn't fight it
  const tabPendingRef = useRef(false)

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commitEdit()
      if (activeCell && activeCell.rowIdx < pageEnd - 1) {
        setActiveCell({ rowIdx: activeCell.rowIdx + 1, colIdx: activeCell.colIdx })
      }
      // Return focus to container so arrow keys work immediately
      containerRef.current?.focus()
    } else if (e.key === "Escape") {
      cancelEdit()
      containerRef.current?.focus()
    } else if (e.key === "Tab") {
      e.preventDefault()
      tabPendingRef.current = true
      commitEdit()
      if (activeCell) {
        const nextColIdx = e.shiftKey
          ? Math.max(0, activeCell.colIdx - 1)
          : Math.min(totalCols - 1, activeCell.colIdx + 1)
        const next = { rowIdx: activeCell.rowIdx, colIdx: nextColIdx }
        setActiveCell(next)
        setTimeout(() => {
          startEdit(next.rowIdx, next.colIdx)
          tabPendingRef.current = false
        }, 0)
      }
    }
  }

  const handleEditBlur = () => {
    // Skip if Tab already handled the commit
    if (tabPendingRef.current) return
    commitEdit()
    // Refocus container only if focus left the table entirely
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        containerRef.current.focus()
      }
    }, 0)
  }

  const handleContainerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editCell || !activeCell) return
    const { rowIdx, colIdx } = activeCell

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        if (rowIdx > pageStart) setActiveCell({ rowIdx: rowIdx - 1, colIdx })
        break
      case "ArrowDown":
        e.preventDefault()
        if (rowIdx < pageEnd - 1) setActiveCell({ rowIdx: rowIdx + 1, colIdx })
        break
      case "ArrowLeft":
        e.preventDefault()
        if (colIdx > 0) setActiveCell({ rowIdx, colIdx: colIdx - 1 })
        break
      case "ArrowRight":
        e.preventDefault()
        if (colIdx < totalCols - 1) setActiveCell({ rowIdx, colIdx: colIdx + 1 })
        break
      case "Tab":
        e.preventDefault()
        setActiveCell({
          rowIdx,
          colIdx: e.shiftKey ? Math.max(0, colIdx - 1) : Math.min(totalCols - 1, colIdx + 1),
        })
        break
      case "Enter":
      case "F2":
        e.preventDefault()
        startEdit(rowIdx, colIdx)
        break
      case "Delete":
      case "Backspace":
        e.preventDefault()
        applyCellValue(rowIdx, allCols[colIdx].key, "")
        break
    }
  }

  // ── Row / column mutations ────────────────────────────────────────────────

  const addRow = () => {
    const row = newEmptyRow(customCols)
    setRows((prev) => {
      const next = [...prev, row]
      onRowsChange?.(next)
      return next
    })
    const newLastPage = Math.ceil((rows.length + 1) / rowsPerPage)
    setCurrentPage(newLastPage)
    setActiveCell({ rowIdx: rows.length, colIdx: 0 })
    containerRef.current?.focus()
  }

  const deleteRow = (rowIdx: number) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== rowIdx)
      onRowsChange?.(next)
      return next
    })
    if (activeCell?.rowIdx === rowIdx) setActiveCell(null)
  }

  const confirmAddCol = () => {
    const name = newColName.trim()
    if (!name) return
    const fieldKey = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
    const col: CustomColumn = {
      id: crypto.randomUUID(),
      field_key: fieldKey,
      field_name: name,
      field_type: "text",
    }
    setCustomCols((prev) => {
      const next = [...prev, col]
      onCustomColumnsChange?.(next)
      return next
    })
    setRows((prev) => prev.map((r) => ({ ...r, custom: { ...r.custom, [fieldKey]: "" } })))
    setNewColName("")
    setAddingCol(false)
    containerRef.current?.focus()
  }

  const deleteCustomCol = (fieldKey: string) => {
    setCustomCols((prev) => {
      const next = prev.filter((c) => c.field_key !== fieldKey)
      onCustomColumnsChange?.(next)
      return next
    })
    setRows((prev) =>
      prev.map((r) => {
        const custom = { ...r.custom }
        delete custom[fieldKey]
        return { ...r, custom }
      })
    )
    if (activeCell) setActiveCell(null)
    if (editCell) setEditCell(null)
  }

  // ── Cell renderer ─────────────────────────────────────────────────────────

  const renderCell = (row: InfluencerRow, rowIdx: number, col: AnyColDef, colIdx: number) => {
    const isActive  = activeCell?.rowIdx === rowIdx && activeCell?.colIdx === colIdx
    const isEditing = editCell?.rowIdx === rowIdx && editCell?.colIdx === colIdx
    const value     = getCellValue(row, col.key)
    const ringCls   = isActive ? "ring-2 ring-inset ring-blue-500 z-[1]" : ""

    if (isEditing) {
      if (col.type === "select" && col.options) {
        return (
          <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{ minWidth: col.minWidth }}>
            <select
              ref={editInputRef as React.RefObject<HTMLSelectElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditBlur}
              onKeyDown={handleEditKeyDown}
              className="w-full h-full px-2 py-1.5 text-sm outline-none bg-white appearance-none"
            >
              {col.options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
            </select>
          </td>
        )
      }
      return (
        <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{ minWidth: col.minWidth }}>
          <input
            ref={editInputRef as React.RefObject<HTMLInputElement>}
            type={col.type === "number" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditBlur}
            onKeyDown={handleEditKeyDown}
            className="w-full h-full px-2 py-1.5 text-sm outline-none bg-white"
          />
        </td>
      )
    }

    return (
      <td
        key={col.key}
        className={`border border-gray-200 px-2 py-1.5 text-sm cursor-cell select-none relative hover:bg-blue-50/20 ${ringCls}`}
        style={{ minWidth: col.minWidth }}
        onClick={() => startEdit(rowIdx, colIdx)}
        onFocus={() => setActiveCell({ rowIdx, colIdx })}
      >
        {col.key === "contact_status"
          ? <StatusBadge value={value} />
          : <span className="block truncate">{value}</span>
        }
      </td>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">

      {/* ── Scrollable grid ── */}
      <div
        ref={containerRef}
        className="overflow-auto border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
        tabIndex={0}
        onKeyDown={handleContainerKeyDown}
        onMouseDown={() => setTimeout(() => containerRef.current?.focus(), 0)}
      >
        <table className="text-sm border-collapse" style={{ minWidth: "max-content" }}>

          {/* ── Sticky two-row header ── */}
          <thead className="sticky top-0 z-10">
            <tr>
              <th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem] text-center text-xs text-gray-400 font-normal">#</th>

              <th colSpan={INFLUENCER_COL_COUNT} className="border border-gray-200 bg-blue-50 text-center text-xs font-semibold text-blue-700 py-1.5 px-3 whitespace-nowrap">
                Influencer
              </th>

              <th colSpan={brandColCount} className="border border-gray-200 bg-emerald-50 text-center text-xs font-semibold text-emerald-700 py-1.5 px-3 whitespace-nowrap">
                Brand Details
              </th>

              {!readOnly && (
                <th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem] text-center">
                  <button
                    onClick={() => setAddingCol(true)}
                    title="Add column"
                    className="w-6 h-6 mx-auto flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
                  >
                    <IconPlus size={14} />
                  </button>
                </th>
              )}

              <th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem]" />
            </tr>

            <tr>
              {allCols.map((col) => (
                <th
                  key={col.key}
                  className={`border border-gray-200 px-2 py-1.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap group/col ${
                    col.group === "Influencer" ? "bg-blue-50/60" : "bg-emerald-50/60"
                  }`}
                  style={{ minWidth: col.minWidth }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{col.label}</span>
                    {!readOnly && col.isCustom && (
                      <button
                        onClick={() => deleteCustomCol((col as CustomColDef).fieldKey)}
                        title="Remove column"
                        className="opacity-0 group-hover/col:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <IconX size={12} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body (current page only) ── */}
          <tbody>
            {pageRows.map((row, localIdx) => {
              const rowIdx = pageStart + localIdx
              return (
                <tr key={row.id} className="group">
                  <td className="border border-gray-200 text-center text-xs text-gray-400 bg-gray-50/40 select-none">
                    {rowIdx + 1}
                  </td>

                  {allCols.map((col, colIdx) => renderCell(row, rowIdx, col, colIdx))}

                  {!readOnly && <td className="border border-gray-200 bg-gray-50/40" />}

                  <td className="border border-gray-200 text-center bg-gray-50/40">
                    {!readOnly && (
                      <button
                        onClick={() => deleteRow(rowIdx)}
                        title="Delete row"
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}

            {totalRows === 0 && (
              <tr>
                <td colSpan={allCols.length + 3} className="py-10 text-center text-sm text-gray-400">
                  No influencers yet. Click &quot;+ Add row&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>

          {/* ── Footer: Add row ── */}
          {!readOnly && (
            <tfoot>
              <tr>
                <td colSpan={allCols.length + 3} className="border-t border-gray-200">
                  <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"
                  >
                    <IconPlus size={14} />
                    Add row
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ── Keyboard shortcuts bar ── */}
      {!readOnly && (
        <div className="flex items-center gap-4 px-1 flex-wrap">
          {(
            [
              { keys: ["↑", "↓", "←", "→"], label: "Navigate" },
              { keys: ["Enter"],             label: "Edit" },
              { keys: ["Tab"],               label: "Next cell" },
              { keys: ["Shift", "Tab"],      label: "Prev cell" },
              { keys: ["Esc"],               label: "Cancel" },
              { keys: ["Del"],               label: "Clear" },
              { keys: ["F2"],                label: "Edit (alt)" },
            ] as { keys: string[]; label: string }[]
          ).map(({ keys, label }) => (
            <div key={label} className="flex items-center gap-1">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono text-gray-500 shadow-sm leading-none"
                >
                  {k}
                </kbd>
              ))}
              <span className="text-[11px] text-gray-400 ml-0.5">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalRows > 0 && (
        <div className="flex items-center justify-between gap-4 text-sm text-gray-600 px-1 flex-wrap">

          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white outline-none focus:ring-2 ring-blue-400"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page info + controls */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">
              {pageStart + 1}–{pageEnd} of {totalRows}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Prev
              </button>

              <span className="px-3 py-1 border border-gray-200 rounded-lg text-xs bg-white min-w-[70px] text-center">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition"
              >
                »
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── Add column modal ── */}
      {!readOnly && addingCol && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setAddingCol(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">New Column</h3>
              <button
                onClick={() => setAddingCol(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Column name</label>
              <input
                ref={newColInputRef}
                type="text"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmAddCol()
                  if (e.key === "Escape") setAddingCol(false)
                }}
                placeholder="e.g. Budget, Product Sent…"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"
              />
              <p className="text-xs text-gray-400">This will be added as a custom field under Brand Details.</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingCol(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddCol}
                disabled={!newColName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <IconCheck size={14} />
                Add Column
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
