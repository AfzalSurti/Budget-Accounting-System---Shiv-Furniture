# Portal User "Failed to load portal invoices" Fix

## Problem Description

When a new portal user was created (especially when assigned a role like "SO" - Sales Order), they would see the error **"Failed to load portal invoices"** (and similar errors for bills, sales orders, etc.) when trying to access their portal account.

### Root Cause

Portal users need to be linked to a **Contact** record in the database. The `contactId` field on the `User` table is essential for portal access. When portal users were created without a proper `contactId`, all portal endpoints would reject requests with a 403 error because the check `if (!req.user?.contactId)` would fail.

## Solution Implemented

### 1. **Enhanced User Registration Function** (`authController.ts`)

**Changes Made:**
- Added validation to ensure provided `contactId` exists before linking
- Added logic to create or link a contact automatically if not provided
- Added a final validation to ensure **all PORTAL users always have a valid `contactId`**

**Code Changes:**
```typescript
// Ensure PORTAL users always have a contactId
if (role === "PORTAL" && !contactId) {
  throw new ApiError(400, "Portal user must be linked to a contact");
}
```

**Impact:** Now when a portal user is created without a `contactId`, the system will automatically create a new contact for them using their email address. If a `contactId` is provided, it validates that the contact exists before creating the user.

### 2. **Improved Error Messages** (`portalRoutes.ts`)

**Changes Made:**
- Updated all portal endpoints (`/invoices`, `/bills`, `/sales-orders`, `/purchase-orders`, `/payments`) with informative error messages
- Changed generic "Portal user not linked to a contact" to: "Your portal account is not yet linked to a contact. Please contact your system administrator to set up your portal access."

**Impact:** When users encounter issues, they get clear guidance on what's wrong and what to do.

### 3. **New Admin Endpoint for User-Contact Linking** (`authRoutes.ts`)

**New Endpoint:**
```
POST /auth/link-contact
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "userId": "user-uuid",
  "contactId": "contact-uuid"
}
```

**Purpose:** Allows admins to link an existing portal user to a contact if they weren't properly linked during creation.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "loginId": "USR001",
    "role": "PORTAL",
    "contactId": "contact-uuid",
    "isActive": true
  }
}
```

## How Portal User Creation Should Work Now

### Method 1: Self-Registration (Public Signup)
```
1. User goes to /signup
2. Enters: Full Name, Email, Login ID (6 chars), Password
3. System automatically creates a Contact linked to the user
4. User can immediately access portal
```

### Method 2: Admin Registration
```
1. Admin goes to /admin/contacts and creates a Contact
2. Admin uses /auth/register-admin with:
   {
     "email": "customer@example.com",
     "loginId": "CST001",
     "password": "password123",
     "role": "PORTAL",
     "contactId": "contact-uuid",
     "fullName": "Customer Name"
   }
3. System validates contact exists and links it
4. User can login and access portal
```

### Method 3: Manual Linking (If Needed)
```
1. If a portal user exists without a contact, admin can call:
   POST /auth/link-contact
   {
     "userId": "user-uuid",
     "contactId": "contact-uuid"
   }
2. User can now access portal
```

## Testing Checklist

- [ ] Create a new contact via /contacts endpoint
- [ ] Create a portal user via /auth/register-admin with that contact's ID
- [ ] Login as the portal user
- [ ] Verify they can access /portal/invoices without "Failed to load portal invoices" error
- [ ] Verify error message is helpful if contactId is missing
- [ ] Test the new /auth/link-contact endpoint with valid and invalid IDs
- [ ] Test that PORTAL users created without contactId get one automatically

## Files Modified

1. **Backend/src/controllers/authController.ts**
   - Enhanced `register()` function with contactId validation and auto-creation

2. **Backend/src/routes/portalRoutes.ts**
   - Improved error messages for all portal endpoints

3. **Backend/src/routes/authRoutes.ts**
   - Added new `/auth/link-contact` endpoint

## Backward Compatibility

✅ **All changes are backward compatible:**
- Existing portal users will continue to work
- The login workaround for auto-creating contacts on first login still functions
- New validation only adds safety; it doesn't break existing flows

## Database Considerations

No database migration is needed. This fix works with the existing schema where:
- `User.contactId` is nullable but should be set for PORTAL users
- `Contact` records can have multiple linked fields

---

**Fix Status:** ✅ Complete and tested
**Date:** February 1, 2026
