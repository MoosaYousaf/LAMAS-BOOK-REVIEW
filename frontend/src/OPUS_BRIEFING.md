# Lamas Book Review — OPUS SESSION BRIEFING
> **Model:** `claude --model opus` or `claude --model opusplan`
> **Scope:** Architectural changes, new abstractions, and race condition fixes.
> These tasks require deep reasoning and cross-file coordination.
> Complete these BEFORE running the Sonnet session.

---

## Project Overview

| Detail | Value |
|---|---|
| Framework | React (Create React App) |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Routing | React Router v6 |
| Styling | CSS custom properties (`src/Styles/variables.css`) + component `.css` files |

**Entry point:** `src/App.js`
**Auth service:** `src/Services/supabaseClient.js`
**Key pages:** `src/Pages/Dashboard.js`, `src/Pages/SearchPage.js`
**Shared components:** `src/Components/SidebarNav.jsx`, `src/Components/SearchBar.jsx`

---

## Your Three Tasks

---

### TASK 1 — Create a Global UserContext to Eliminate Redundant Auth Fetches
**Files to create:** `src/Context/UserContext.js`
**Files to modify:** `src/App.js`, `src/Pages/Dashboard.js`, `src/Components/SidebarNav.jsx`

**Problem:**
`SidebarNav.jsx` independently calls `supabase.auth.getUser()` and then queries the
`Profiles` table on every single mount. Every parent page that renders `SidebarNav`
(Dashboard, SearchPage, FriendsPage, etc.) has already made the exact same two calls
moments before. This fires 2 redundant Supabase network requests on every page navigation.

**What to build:**
Create `src/Context/UserContext.js` — a React Context that:
- Fetches the Supabase session and `Profiles` row **once** at app mount
- Exposes `{ userProfile, loading, refreshUser }` to any child component
- Handles the case where the user is not authenticated (returns `null` gracefully)
- Uses a Supabase `onAuthStateChange` listener to stay in sync with login/logout events

Wrap the app in `<UserProvider>` inside `App.js`.

Refactor `SidebarNav.jsx` to read `userProfile` from `useContext(UserContext)` instead
of its own `useEffect` fetch. Remove the `getSession` fetch entirely from that component.

Refactor `Dashboard.js` to also pull the user from context rather than re-fetching,
keeping only the friend count and book fetching logic as local state.

**Coding standards to follow:**
```js
/**
 * UserContext — global authenticated user state.
 *
 * Fetches the Supabase session and Profiles row once at app mount.
 * All child components should read from this context instead of
 * making their own auth calls. (PERF FIX #1)
 *
 * @typedef {{ userProfile: object|null, loading: boolean, refreshUser: function }} UserContextValue
 */
```
- Comment every block of new logic explaining WHY it exists, not just what it does
- Comment any line removed from `SidebarNav` and `Dashboard` explaining what replaced it
- Use the naming convention: `UserContext.js`, `UserProvider`, `useUser` (custom hook)
- No inline style objects — component already has its own CSS file
- All magic numbers must be named constants

---

### TASK 2 — Add Session Caching for Books to Prevent Re-fetch on Every Visit
**Files to modify:** `src/Pages/Dashboard.js`

**Problem:**
`fetchBooksOfTheWeek` runs on every Dashboard mount with no caching. Every time a
user navigates away and back, the book grid is blank while it re-fetches fresh data —
even if the data is only seconds old.

**What to build:**
Add a `sessionStorage` cache layer inside `fetchBooksOfTheWeek`:
- On mount, check `sessionStorage` for a key like `"lbr_books_cache"`
- The cached value should be a JSON object: `{ books: [...], cachedAt: timestamp }`
- If the cache exists and is less than `CACHE_TTL_MS` (5 minutes) old, load from cache
  immediately and skip the Supabase fetch entirely
- If the cache is stale or empty, fetch from Supabase as normal and write the result
  back to `sessionStorage`
- When the user clicks "Shuffle Picks", **bypass and clear the cache** so they always
  get fresh randomized results on a manual refresh

**Coding standards to follow:**
```js
// [PERF FIX #7] Cache TTL — books are re-used for up to 5 minutes to avoid
// redundant Supabase fetches on every Dashboard navigation.
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_KEY = 'lbr_books_cache';
```
- Wrap `sessionStorage` access in try/catch — it can throw in private browsing mode
- Comment the cache-check block clearly so future devs know why the early return exists
- The "Shuffle Picks" button path must include a comment explaining the cache bypass

---

### TASK 3 — Fix the Search Race Condition in SearchBar
**Files to modify:** `src/Components/SearchBar.jsx`

**Problem:**
`SearchBar.jsx` has a 300ms debounce, but once a query fires there is no mechanism to
cancel it if a newer query is already in flight. If query A is slow and query B resolves
first, query A's stale results overwrite query B's correct results when it eventually
resolves. This causes the dropdown to flash or show wrong results on fast typing.

**What to build:**
Implement a request ID pattern using `useRef`:
- Keep a `useRef` counter that increments on every new search invocation
- Before calling `setResults`, compare the request ID that just resolved against the
  current ref value — if they don't match, discard the results silently
- This is lighter than `AbortController` and works well with the existing debounce

```js
// [PERF FIX #8] Request ID guard — prevents stale search results from
// overwriting fresher ones when queries resolve out of order.
const latestRequestId = useRef(0);
```

**Coding standards to follow:**
- Add a JSDoc comment above the updated `useEffect` explaining the race condition
  and how the request ID solves it
- Comment the discard branch so it's clear this is intentional, not a bug
- Do not change the debounce timing or the existing sort logic — only add the guard

---

## Coding Standards (apply to every change)

### Comment All Changes
Every modification to existing code must have a comment above it:
```js
// [PERF FIX #1] Removed redundant auth fetch — user data now comes from
// UserContext which fetches once at app level. See src/Context/UserContext.js.
```

### Comment All New Code with JSDoc
Every new function, hook, or context must have a JSDoc block:
```js
/**
 * useUser — convenience hook for consuming UserContext.
 * Throws if used outside of UserProvider.
 * @returns {UserContextValue}
 */
export const useUser = () => { ... };
```

### Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Context files | PascalCase | `UserContext.js` |
| Custom hooks | camelCase with `use` prefix | `useUser` |
| Cache keys | Prefixed string constants | `'lbr_books_cache'` |
| Constants | SCREAMING_SNAKE_CASE | `CACHE_TTL_MS`, `CACHE_KEY` |

### No Magic Numbers
```js
// ❌ Wrong
const CACHE_TTL_MS = 300000;

// ✅ Correct
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — balances freshness vs. fetch cost
```

### Always Handle Errors Explicitly
```js
// ✅ Log with context so errors are traceable
console.error('[UserContext] Failed to fetch profile:', error.message);
```

---

## When You Are Done

Confirm the following before ending the session:
- [ ] `src/Context/UserContext.js` exists and exports `UserProvider` and `useUser`
- [ ] `App.js` wraps routes in `<UserProvider>`
- [ ] `SidebarNav.jsx` has no `supabase.auth.getUser()` or `Profiles` fetch of its own
- [ ] `Dashboard.js` reads user from context instead of its own auth fetch
- [ ] `sessionStorage` cache is in place in `fetchBooksOfTheWeek`
- [ ] "Shuffle Picks" bypasses and clears the cache
- [ ] Request ID guard is in place in `SearchBar.jsx`
- [ ] All changed lines have comments, all new functions have JSDoc blocks

**Hand off to the Sonnet session once this checklist is complete.**

---
*Opus Briefing — Lamas Book Review Performance Audit, April 2026*
