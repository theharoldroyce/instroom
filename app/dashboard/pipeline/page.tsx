"use client"

import KanbanBoard from "@/components/kanban/kanban-board"

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Box Container */}
      <div className="">

        {/* Kanban Board */}
        <KanbanBoard />

      </div>
    </div>
  )
}