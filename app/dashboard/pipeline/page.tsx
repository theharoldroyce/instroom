"use client"

import KanbanBoard from "@/components/kanban/kanban-board"

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Title */}
      <h2 className="text-base font-medium text-gray-800">
        Pipeline
      </h2>

      {/* Box Container */}
      <div className="rounded-xl border bg-white p-4">

        {/* Kanban Board */}
        <KanbanBoard />

      </div>
    </div>
  )
}