import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teams } from '../config/appwrite';

/**
 * Hook to check if the current user is a team member with review access
 * Checks both Appwrite Teams and VITE_TEAM_MEMBER_EMAILS environment variable
 */
export function useTeamMember() {
  const { user } = useAuth();
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const REVIEW_TEAM_ID = import.meta.env.VITE_REVIEW_TEAM_ID as string;
  const teamMemberEmails = import.meta.env.VITE_TEAM_MEMBER_EMAILS || '';

  useEffect(() => {
    const checkTeamMembership = async () => {
      if (!user) {
        setIsTeamMember(false);
        setLoading(false);
        return;
      }

      const userEmail = user.email?.toLowerCase();
      const emailList = teamMemberEmails
        .split(',')
        .map((email: string) => email.trim().toLowerCase())
        .filter(Boolean);

      // 1. Check if user's email is in VITE_TEAM_MEMBER_EMAILS
      if (userEmail && emailList.includes(userEmail)) {
        setIsTeamMember(true);
        setLoading(false);
        return;
      }

      // 2. Fallback to Appwrite Teams check if configured
      if (REVIEW_TEAM_ID) {
        try {
          const userTeams = await teams.list();
          const userIsMember = userTeams.teams.some(
            (team) => team.$id === REVIEW_TEAM_ID
          );
          if (userIsMember) {
            setIsTeamMember(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Appwrite teams check failed:', error);
        }
      }

      setIsTeamMember(false);
      setLoading(false);
    };

    checkTeamMembership();
  }, [user, REVIEW_TEAM_ID, teamMemberEmails]);

  return { isTeamMember, loading };
}
