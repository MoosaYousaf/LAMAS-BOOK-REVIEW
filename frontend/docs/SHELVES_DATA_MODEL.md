# Shelves Data Model (MVP Proposal)

This project is moving toward a Goodreads-style shelf system.

## Goal
Allow each authenticated user to categorize books into reading states:
- `to-read`
- `currently-reading`
- `read`

## Recommended table design

### 1) `Books`
Already present in current app search flow.

### 2) `Profiles`
Already present in onboarding flow.

### 3) `UserBookShelves` (new junction table)
Suggested columns:
- `id` UUID primary key
- `user_id` UUID (FK -> Profiles.id)
- `book_id` text/UUID (FK -> Books.id; type depends on Books schema)
- `shelf_slug` text (`to-read`, `currently-reading`, `read`)
- `created_at` timestamp
- `updated_at` timestamp

## Constraints
- Unique composite on `(user_id, book_id)` so each user has one shelf state per book.
- Check constraint for allowed `shelf_slug` values.

## Security (Supabase RLS)
- Users can `select/insert/update/delete` rows where `user_id = auth.uid()`.
- No cross-user write access.

## Frontend behavior roadmap
1. Add "Add to shelf" action in `BookCard` and search results.
2. `ShelvesPage` queries `UserBookShelves` for current user.
3. Allow moving book between shelves (single update).
4. Add sorting and pagination once shelf size grows.
