import { supabase } from './supabaseClient';

export const searchDatabase = async (query, type) => {
  if (!query) return [];

  let table = (type === "users") ? "Profiles" : "Books";

  // [PERF FIX #3] Replaced select("*") with only the columns needed for
  // BookCard/UserCard display. Reduces payload size significantly on search results.
  const columns = (type === "users")
    ? "id, username, avatar_url"
    : "isbn, book_title, book_author, image_url_m, image_url_l";
  let queryBuilder = supabase.from(table).select(columns);

  // Handle different search categories
  if (type === "users") {
    queryBuilder = queryBuilder.ilike("username", `%${query}%`);
  } else if (type === "author") {
    queryBuilder = queryBuilder.ilike("book_author", `%${query}%`);
  } else {
    // Default: search by title
    queryBuilder = queryBuilder.ilike("book_title", `%${query}%`);
  }

  const { data, error } = await queryBuilder.limit(100);
  
  if (error) {
    console.error("Supabase Error:", error);
    return [];
  }
  return data;
};