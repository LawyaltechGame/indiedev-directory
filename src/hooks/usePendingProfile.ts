import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPendingProfile } from '../services/profile';

export function usePendingProfile() {
  const { user } = useAuth();
  const [hasPendingProfile, setHasPendingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
  const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

  const checkPendingProfile = useCallback(async () => {
    if (!user || !DB_ID || !PROFILE_TABLE_ID) {
      setHasPendingProfile(false);
      setLoading(false);
      return;
    }

    try {
      const userId = (user as any).$id || (user as any).id;
      const pendingProfile = await getUserPendingProfile(DB_ID, PROFILE_TABLE_ID, userId);
      setHasPendingProfile(!!pendingProfile);
    } catch (error) {
      console.error('Error checking pending profile:', error);
      setHasPendingProfile(false);
    } finally {
      setLoading(false);
    }
  }, [user, DB_ID, PROFILE_TABLE_ID]);

  useEffect(() => {
    checkPendingProfile();
    
    // Check every 30 seconds for status updates
    const interval = setInterval(checkPendingProfile, 30000);
    
    return () => clearInterval(interval);
  }, [checkPendingProfile]);

  return { hasPendingProfile, loading, refresh: checkPendingProfile };
}

