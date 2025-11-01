import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teams } from '../config/appwrite';

/**
 * Hook to check if the current user is a team member with review access
 * Uses Appwrite Teams for proper team-based authentication
 */
export function useTeamMember() {
  const { user } = useAuth();
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const REVIEW_TEAM_ID = import.meta.env.VITE_REVIEW_TEAM_ID as string;

  useEffect(() => {
    const checkTeamMembership = async () => {
      if (!user) {
        setIsTeamMember(false);
        setLoading(false);
        return;
      }

      if (!REVIEW_TEAM_ID) {
        console.warn('VITE_REVIEW_TEAM_ID not configured. Falling back to email-based check.');
        // Fallback to email-based check if team ID not configured
        const teamMemberEmails = import.meta.env.VITE_TEAM_MEMBER_EMAILS;
        if (teamMemberEmails) {
          const emailList = teamMemberEmails.split(',').map((email: string) => email.trim().toLowerCase());
          const userEmail = user.email?.toLowerCase();
          setIsTeamMember(userEmail ? emailList.includes(userEmail) : false);
        } else {
          setIsTeamMember(false);
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get all teams the current user is a member of
        // This is the correct way - we check the user's teams, not list all memberships
        const userTeams = await teams.list();
        
        console.log('User teams:', userTeams.teams.map(t => ({ id: t.$id, name: t.name })));
        console.log('Review Team ID:', REVIEW_TEAM_ID);
        
        // Check if the review team ID is in the user's teams
        const userIsMember = userTeams.teams.some(
          (team) => team.$id === REVIEW_TEAM_ID
        );
        
        console.log('Is team member:', userIsMember);
        setIsTeamMember(userIsMember);
      } catch (error: any) {
        console.error('Error checking team membership:', error);
        console.error('Error message:', error?.message);
        console.error('Error code:', error?.code);
        setIsTeamMember(false);
      } finally {
        setLoading(false);
      }
    };

    checkTeamMembership();
  }, [user, REVIEW_TEAM_ID]);

  return { isTeamMember, loading };
}

