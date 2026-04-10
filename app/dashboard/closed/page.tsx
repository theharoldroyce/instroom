"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { useDroppable } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import { IconPlus, IconSearch } from "@tabler/icons-react"

const columns = [
  { key: "for-creation", title: "For Order Creation", color: "bg-[#1FAE5B]" },
  { key: "in-transit", title: "In-Transit", color: "bg-yellow-500" },
  { key: "delivered", title: "Delivered", color: "bg-cyan-500" },
  { key: "posted", title: "Posted", color: "bg-[#0F6B3E]" },
  { key: "completed", title: "Completed", color: "bg-pink-500" },
]

const initialTasks = [
  {
    id: "1",
    name: "Marisha Nicole",
    handle: "@luxe_liftin",
    followers: "56.6k",
    status: "for-creation",
  },
  {
    id: "2",
    name: "Emma Murray",
    handle: "@emmabrah",
    followers: "35.1k",
    status: "in-transit",
  },
  {
    id: "3",
    name: "Shaquille",
    handle: "@shaquille",
    followers: "13k",
    status: "delivered",
  },
]

// ─── Droppable Column ───────────────────────────────────────────────────────
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 transition-colors ${
        isOver ? "bg-gray-50 rounded-lg" : ""
      }`}
    >
      {children}
    </div>
  )
}

// ─── Draggable Card (whole card is drag handle) ─────────────────────────────
function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg opacity-50" : ""
      }`}
    >
      {children}
    </div>
  )
}

export default function ClosedPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [search, setSearch] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filteredTasks = tasks.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.handle.toLowerCase().includes(search.toLowerCase())
  )

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const draggedId = active.id as string
    const destinationKey = over.id as string
    const draggedTask = tasks.find((t) => t.id === draggedId)
    if (!draggedTask) return

    if (draggedTask.status === destinationKey) return

    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggedId ? { ...t, status: destinationKey } : t
      )
    )

    const columnTitle = columns.find((c) => c.key === destinationKey)?.title
    setShowToast(`${draggedTask.name} moved to ${columnTitle}`)
    setTimeout(() => setShowToast(null), 3000)
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
          {showToast}
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative w-full max-w-md">
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search influencer..."
          className="w-full pl-9 pr-3 h-10 border border-[#0F6B3E]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B]"
        />
      </div>

      {/* BOARD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-xl border border-[#0F6B3E]/10 bg-white p-5">
          <div className="grid grid-cols-5 gap-4">
            {columns.map((col) => {
              const items = filteredTasks.filter((t) => t.status === col.key)

              return (
                <DroppableColumn key={col.key} id={col.key}>
                  {/* HEADER */}
                  <div
                    className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex justify-between`}
                  >
                    <span>
                      {items.length} {col.title}
                    </span>
                  </div>

                  {/* CARDS */}
                  {items.map((task) => (
                    <DraggableCard key={task.id} id={task.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-sm">
                          {task.name.charAt(0)}
                        </div>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{task.name}</span>
                          <span className="text-xs text-gray-500">
                            {task.handle}
                          </span>
                          <span className="text-xs text-gray-400">
                            👥 {task.followers}
                          </span>
                        </div>
                      </div>
                    </DraggableCard>
                  ))}

                  {/* DROP AREA */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition">
                    <span>Drop Here</span>
                    <IconPlus size={16} />
                  </div>
                </DroppableColumn>
              )
            })}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-lg rotate-2 w-[220px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-sm">
                  {activeTask.name.charAt(0)}
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{activeTask.name}</span>
                  <span className="text-xs text-gray-500">
                    {activeTask.handle}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}