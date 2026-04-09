import { supabase } from './supabaseClient';

export const searchDatabase = async (query, type) => {
  if (!query) return [];

  let table = (type === "users") ? "Profiles" : "Books";
  let queryBuilder = supabase.from(table).select("*");

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