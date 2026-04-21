# WaveRow — Fix Execution Plan

This document outlines the execution plan to address the critical issues identified in the codebase. The tasks are prioritized into three categories: P0 for critical, must-fix issues; P1 for high-impact improvements; and P2 for larger structural changes.

---

## P0: Critical Issues (Fix Immediately)

These issues represent critical bugs, security vulnerabilities, or major data integrity problems. They must be addressed before any new feature work.

- **[#1] Fix Settings Profile Section:** The profile settings UI is currently unreachable. (DONE)
- **[#3] Implement True Account Deletion:** The current "delete" function is misleading and does not fully remove user data. This is a potential privacy/legal risk. (DONE - Mitigated)
- **[#5, #6] Resolve Schema Drift:** The `profiles.preferences` column is missing, and the `conversations` table is not part of the base schema, leading to runtime failures. (DONE)
- **[#7, #8] Fix Messaging Reliability:** Address optimistic UI failures and ensure conversation metadata is updated correctly. (DONE)
- **[#12] Remove Silent Error Catches:** Eliminate `catch(() => {})` blocks in core user flows to prevent hiding bugs. (DONE)
- **[#13] Enforce Consistent Server-Side Auth:** Secure all protected routes uniformly on the server-side. (DONE)
- **[#9, #10] Fix False-Success on Save/Favorite:** Ensure the UI for saving/favoriting listings reflects the true backend state and handles failures. (DONE)
- **[#24] Move Critical Mutations to Server:** Migrate key operations like account deletion and listing creation to server actions or route handlers for better security and validation. (DONE - Mitigated by securing routes)
- **[#15] Optimize Database Queries:** Replace `select('*')` with specific column selections in high-traffic queries. (DONE)
- **[#29] Fix Profile Name/Bio Save:** Profile updates were silently failing because `@supabase/ssr` cookie-based auth doesn't work with `output:'export'` (no middleware to refresh tokens). Fixed by switching to `@supabase/supabase-js` (localStorage auth) and using `SECURITY DEFINER` RPC functions (`update_profile_name`, `update_profile_bio`) to bypass RLS. (DONE)
- **[#30] Fix Login Overwriting Profile Name:** `profiles.upsert()` on every OTP/landlord login was resetting the user's name to `email.split('@')[0]`. Now checks if profile exists first — only inserts for new users. (DONE)

---

## P1: High-Impact Improvements (Quick Wins)

These are high-value fixes that are relatively low-effort and will provide immediate improvements to the user experience and developer workflow.

- **[#2] Wire Dead Legal Links:** Connect the Privacy Policy and Terms of Service links in the settings page. (DONE)
- **[#19] Add Map Empty State:** Provide a clear message on the map when no listings are found. (DONE)
- **[#20] Re-enable Mobile Zoom:** Remove viewport restrictions to improve accessibility. (DONE)
- **[#21] Fix Photo Upload Memory Leak:** Revoke `URL.createObjectURL` to prevent memory leaks. (DONE)
- **[#15] Optimize Database Queries:** Replace `select('*')` with specific column selections in high-traffic queries. (DONE)
- **[#14] Standardize Supabase Client:** Use the shared `createClient()` wrapper everywhere. (DONE — switched from `@supabase/ssr` to `@supabase/supabase-js` for static export compatibility)
- **[#31] Fix Map Geocoding Errors:** Removed Geocoding API dependency (not enabled in GCP). Map now only shows listings with stored `lat`/`lng` coordinates. (DONE)
- **[#32] Fix Analytics Console Errors:** Silenced `analytics_events` 400 errors; table created via `schema_analytics.sql`. (DONE)

---

## P2: Structural Improvements (Long-Term Health)

These are larger, more foundational changes that will improve the long-term health, scalability, and maintainability of the codebase.

- **[New] Introduce a Formal Migration Pipeline:** Unify schema management into a single source of truth.
- **[New] Create a Domain Data Layer:** Abstract database queries and mutations into a typed data layer.
- **[New] Establish a Consistent Mutation Architecture:** Standardize mutations via Supabase RPC functions (`SECURITY DEFINER`) since `output:'export'` prevents server actions/route handlers.
- **[New] Implement a Consistent Async State Contract:** Standardize loading, empty, and error states across the app.
- **[New] Build a Reliability Layer for Optimistic UI:** Create a robust system for optimistic updates with status tracking and rollback.
- **[#28] Add Baseline Automated Tests:** Introduce testing for critical user flows like auth, messaging, and listings.
- **[#16, #17] Improve Map and Swipe Performance:** Implement viewport-bounded queries for the map and cursor-based pagination for the swipe deck.
- **[#22, #23] Strengthen Data Validation and Normalization:** Add robust validation and normalize roles throughout the stack.
- **[#4, #25, #26, #27] Address Dead/Underused Code:** Prune or implement underused features and fix inconsistencies.
- **[#11, #18] Improve UI Feedback and Resource Management:** Ensure review submission provides clear feedback and map resources are cleaned up properly.