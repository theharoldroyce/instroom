"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Trash2, Mail } from "lucide-react"

interface Collaborator {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  joinedAt?: string
}

export default function CollaboratorsPage() {
  const [brandId, setBrandId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [owner, setOwner] = useState<Collaborator | null>(null)
  const [members, setMembers] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("collaborator")
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  // Handle hydration and set brandId from search params
  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    const id = params.get("brandId")
    setBrandId(id)
  }, [])

  // Fetch collaborators
  useEffect(() => {
    const fetchCollaborators = async () => {
      if (!brandId) return

      try {
        setLoading(true)
        setError("")
        const res = await fetch(`/api/brand/${brandId}/collaborators`)
        const data = await res.json()

        if (!res.ok) {
          // Handle specific error codes
          if (res.status === 403) {
            setError("You don't have permission to manage collaborators for this brand. Make sure you're the brand owner.")
          } else if (res.status === 404) {
            setError("Brand not found.")
          } else {
            setError(data.error || "Failed to fetch collaborators")
          }
          return
        }

        setOwner(data.owner)
        setMembers(data.members || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching collaborators")
      } finally {
        setLoading(false)
      }
    }

    fetchCollaborators()
  }, [brandId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !brandId) return

    try {
      setInviting(true)
      setError("")
      const res = await fetch(`/api/brand/${brandId}/collaborators/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to invite collaborator")
        return
      }

      // Reload collaborators
      const refetch = await fetch(`/api/brand/${brandId}/collaborators`)
      const refreshed = await refetch.json()
      setMembers(refreshed.members || [])
      setInviteEmail("")
      setInviteRole("collaborator")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!brandId || !confirm("Remove this collaborator?")) return

    try {
      setRemoving(userId)
      setError("")
      const res = await fetch(`/api/brand/${brandId}/collaborators/${userId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to remove collaborator")
        return
      }

      // Remove from list
      setMembers(members.filter((m) => m.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setRemoving(null)
    }
  }

  if (!mounted) {
    return null
  }

  if (!brandId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Brand Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please select a brand to manage collaborators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team & Collaborators</h1>
        <p className="text-muted-foreground mt-2">Manage who has access to your brand</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Owner */}
      {owner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={owner.image || ""} alt={owner.name || ""} />
                  <AvatarFallback>
                    {(owner.name || owner.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{owner.name || owner.email}</p>
                  <p className="text-xs text-muted-foreground">{owner.email}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-background rounded">
                Owner
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite Collaborator</CardTitle>
          <CardDescription>
            Add team members to collaborate on your brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborator">Collaborator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              {inviting ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Collaborators List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading collaborators...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No collaborators yet. Invite team members to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.image || ""}
                        alt={member.name || ""}
                      />
                      <AvatarFallback>
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.name || member.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium capitalize px-2 py-1 bg-muted rounded">
                      {member.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      disabled={removing === member.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
