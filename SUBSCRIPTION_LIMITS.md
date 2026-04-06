# Subscription-Based Brand & Collaborator Limits

## Overview

This implementation enforces subscription plan limits on:
- **Number of brands** a user can create
- **Number of collaborators** per brand

## Plan Limits

| Plan | Max Brands | Max Collaborators (Seats) | Can Invite |
|------|-----------|--------------------------|-----------|
| **Solo** | 1 | N/A | ❌ No |
| **Team** | Based on `max_brands` | Based on `max_seats` | ✅ Yes |
| **Agency** | Based on `max_brands` | Based on `max_seats` | ✅ Yes |

Extra seats/brands can be purchased via `UserSubscription.extra_seats` and `UserSubscription.extra_brands`.

## Files Created

### 1. **lib/subscription-limits.ts**
Helper functions to check subscription limits:

```typescript
// Check if user can add a brand
const canAdd = await canAddBrand(userId)
// Returns: { allowed: boolean, current: number, max: number, message?: string }

// Check if user can add collaborators to a brand
const canAdd = await canAddCollaborator(userId, brandId)
// Returns: { allowed: boolean, current: number, max: number, message?: string }

// Get user's subscription details
const subscription = await getSubscriptionDetails(userId)
```

### 2. **app/api/brand/create/route.ts**
Create a new brand with validation:

```bash
POST /api/brand/create
Content-Type: application/json

{
  "name": "My Brand",
  "description": "Brand description",
  "website_url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "brand": { /* brand object */ },
  "remaining": 2  // Remaining brands user can create
}
```

**Errors:**
- `403` - User has reached brand limit
- `401` - Not authenticated
- `400` - Missing required fields

### 3. **app/api/brand/add-collaborator/route.ts**
Add a collaborator to a brand:

```bash
POST /api/brand/add-collaborator
Content-Type: application/json

{
  "brandId": "csx123",
  "email": "teammate@example.com",
  "role": "collaborator"  // 'owner', 'collaborator', 'viewer'
}
```

**Response (if user exists):**
```json
{
  "success": true,
  "type": "direct_member",
  "member": { /* BrandMember object */ },
  "remaining": 4  // Remaining seats available
}
```

**Response (if user doesn't exist):**
```json
{
  "success": true,
  "type": "invitation_sent",
  "invitation": { /* BrandInvitation object */ },
  "remaining": 4
}
```

**Errors:**
- `403` - User has reached collaborator limit (Solo plan cannot add any)
- `401` - Not authenticated
- `400` - Missing required fields or user already a member

### 4. **app/api/subscription/limits/route.ts**
Check subscription limits without making changes:

```bash
# Check brand limits
GET /api/subscription/limits?type=brand

# Check collaborator limits
GET /api/subscription/limits?type=collaborator&brandId=csx123
```

**Response:**
```json
{
  "allowed": true,
  "current": 1,
  "max": 3,
  "message": null
}
```

## Usage Examples

### Frontend - Check if user can add brand

```typescript
const response = await fetch('/api/subscription/limits?type=brand')
const { allowed, current, max, message } = await response.json()

if (!allowed) {
  showError(message) // "Solo plan only includes 1 brand..."
} else {
  showAddBrandForm()
}
```

### Frontend - Create brand

```typescript
const response = await fetch('/api/brand/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Brand',
    description: 'My new brand',
  })
})

if (response.ok) {
  const { brand, remaining } = await response.json()
  // Show success and remaining slots
} else {
  const { error, current, max } = await response.json()
  // Show error message
}
```

### Frontend - Invite collaborator

```typescript
const response = await fetch('/api/brand/add-collaborator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brandId: 'csx123',
    email: 'teammate@example.com',
    role: 'collaborator'
  })
})

if (response.ok) {
  const { type, remaining } = await response.json()
  // type: 'direct_member' or 'invitation_sent'
  // Show success message
} else {
  const { error, current, max } = await response.json()
  // Show error with current/max slots
}
```

## Database Structure (No Changes Needed)

The implementation uses existing tables:
- `Brand` - User's brands (owner_id)
- `BrandMember` - Collaborators (tracks members who joined)
- `BrandInvitation` - Pending invitations
- `UserSubscription` - Subscription with `extra_seats`, `extra_brands`
- `SubscriptionPlan` - Plan limits (`max_brands`, `max_seats`)

## Flow

```
User Signs Up
    ↓
Chooses Plan (Solo/Team/Agency)
    ↓
├─ Solo Plan
│  └─ Can create 1 brand
│  └─ Cannot invite collaborators
│  └─ Must upgrade to add more
│
├─ Team Plan
│  └─ Can create max_brands (e.g., 3 brands)
│  └─ Can invitemax_seats collaborators per brand (e.g., 5)
│  └─ Can purchase extra_seats and extra_brands
│
└─ Agency Plan
   └─ Can create max_brands (e.g., unlimited)
   └─ Can invite max_seats collaborators (e.g., unlimited)
   └─ Can purchase extra, extras
```

## Notes

- Collaborators can be existing Instroom users (direct member) or new users (invitation)
- Invitations expire in 7 days
- Solo plan users cannot add any collaborators
- All actions are logged in `ActivityLog` for audit trail
- Role-based access: owner, collaborator, viewer
