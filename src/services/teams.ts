import { teams } from '../config/appwrite';

/**
 * Check if a user is a member of the review team
 * @param userId - The user ID to check
 * @param teamId - The team ID (from environment variable)
 * @returns Promise<boolean> - True if user is in the team
 */
export async function isUserInReviewTeam(userId: string, teamId: string): Promise<boolean> {
  try {
    if (!teamId) {
      console.warn('VITE_REVIEW_TEAM_ID not configured');
      return false;
    }

    // Get list of members in the team
    const members = await teams.listMemberships(teamId);
    
    // Check if the user ID is in the members list
    const isMember = members.memberships.some(
      (membership) => membership.userId === userId
    );
    
    return isMember;
  } catch (error) {
    console.error('Error checking team membership:', error);
    return false;
  }
}

/**
 * Get all teams the user is a member of
 * @param _userId - The user ID
 * @returns Promise<string[]> - Array of team IDs
 */
export async function getUserTeams(_userId: string): Promise<string[]> {
  try {
    const userTeams = await teams.list();
    return userTeams.teams.map((team) => team.$id);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return [];
  }
}

