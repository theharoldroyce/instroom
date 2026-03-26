"use client"

import KanbanBoard from "./kanban/kanban-board"

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <KanbanBoard />
      </div>
    </div>
  )
}