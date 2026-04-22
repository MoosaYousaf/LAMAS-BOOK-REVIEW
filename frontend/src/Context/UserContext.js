/**
 * UserContext — global authenticated user state.
 *
 * Fetches the Supabase session and Profiles row once at app mount.
 * All child components should read from this context instead of
 * making their own auth calls. (PERF FIX #1)
 *
 * @typedef {{ userProfile: object|null, loading: boolean, refreshUser: function }} UserContextValue
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../Services/supabaseClient';

/**
 * React Context holding the authenticated user's profile data.
 * @type {React.Context<UserContextValue|null>}
 */
const UserContext = createContext(null);

/**
 * UserProvider — wraps the app to provide global user state.
 *
 * Fetches the current Supabase session once at mount and subscribes to
 * auth state changes (login/logout). When authenticated, fetches the
 * corresponding Profiles row and exposes it to all child components.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element}
 */
export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * fetchProfile — retrieves the Profiles row for a given user ID.
   * Called whenever we have a valid authenticated user.
   *
   * @param {string} userId - The Supabase auth user ID
   */
  const fetchProfile = useCallback(async (userId) => {
    const { data: profile, error } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // [PERF FIX #1] Log context-specific errors for debugging.
      console.error('[UserContext] Failed to fetch profile:', error.message);
      setUserProfile(null);
    } else {
      setUserProfile(profile);
    }
    setLoading(false);
  }, []);

  /**
   * refreshUser — manually re-fetches the user profile.
   * Useful after profile updates (avatar change, username edit, etc.)
   * without requiring a full page reload.
   */
  const refreshUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchProfile(user.id);
    }
  }, [fetchProfile]);

  useEffect(() => {
    /**
     * Initial session check on mount.
     * Fetches the current auth user and loads their profile if authenticated.
     */
    const initializeSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // [PERF FIX #1] User not authenticated — set null profile gracefully.
        setUserProfile(null);
        setLoading(false);
        return;
      }

      await fetchProfile(user.id);
    };

    initializeSession();

    /**
     * onAuthStateChange listener — keeps context in sync with login/logout events.
     * This ensures the UserContext updates automatically when:
     * - User logs in (fetches new profile)
     * - User logs out (clears profile to null)
     * - Session refreshes (re-validates profile)
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{ userProfile, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * useUser — convenience hook for consuming UserContext.
 * Throws if used outside of UserProvider to catch integration errors early.
 *
 * @returns {UserContextValue} The current user context value
 * @throws {Error} If called outside of UserProvider
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error(
      '[useUser] Hook must be used within a UserProvider. ' +
      'Wrap your app in <UserProvider> in App.js.'
    );
  }
  return context;
};

export default UserContext;
