import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserLatestProfile } from '../services/profile';

export function useHasProfile() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
  const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

  const checkProfile = useCallback(async () => {
    if (!user || !DB_ID || !PROFILE_TABLE_ID) {
      setHasProfile(false);
      setLoading(false);
      return;
    }

    try {
      const userId = (user as any).$id || (user as any).id;
      const profile = await getUserLatestProfile(DB_ID, PROFILE_TABLE_ID, userId);
      setHasProfile(!!profile);
    } catch (error) {
      console.error('Error checking profile:', error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  }, [user, DB_ID, PROFILE_TABLE_ID]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  return { hasProfile, loading, refresh: checkProfile };
}
