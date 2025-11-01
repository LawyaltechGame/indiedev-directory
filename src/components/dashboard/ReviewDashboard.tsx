import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTeamMember } from '../../hooks/useTeamMember';
import { getAllProfiles, updateProfileStatus, deleteProfile } from '../../services/profile';
import { Button } from '../ui/Button';

interface Profile {
  $id: string;
  userId: string;
  name: string;
  tagline: string;
  genre: string;
  platform: string;
  teamSize: string;
  location: string;
  description?: string;
  website?: string;
  email: string;
  status: string;
  createdAt: string;
}

interface ReviewDashboardProps {
  onClose?: () => void;
}

export function ReviewDashboard({ onClose }: ReviewDashboardProps) {
  const { user } = useAuth();
  const { isTeamMember, loading: teamLoading } = useTeamMember();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Profile | null>(null);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
  const PROFILE_TABLE_ID = import.meta.env.VITE_APPWRITE_PROFILE_TABLE_ID as string;

  const fetchProfiles = async () => {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      console.error('Missing database configuration');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getAllProfiles(DB_ID, PROFILE_TABLE_ID);
      setProfiles(data as any);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      alert('Failed to load profiles. Please check your database configuration.');
    } finally {
      setLoading(false);
    }
  };

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Only fetch profiles if user is authorized
    if (user && isTeamMember && !teamLoading && DB_ID && PROFILE_TABLE_ID) {
      const loadProfiles = async () => {
        try {
          setLoading(true);
          const data = await getAllProfiles(DB_ID, PROFILE_TABLE_ID);
          setProfiles(data as any);
        } catch (error) {
          console.error('Error fetching profiles:', error);
          alert('Failed to load profiles. Please check your database configuration.');
        } finally {
          setLoading(false);
        }
      };
      loadProfiles();
    } else if (!user || !isTeamMember) {
      setLoading(false);
    }
  }, [user, isTeamMember, teamLoading, DB_ID, PROFILE_TABLE_ID]);

  // Show loading while checking team membership
  if (teamLoading) {
    return (
      <div className="min-h-screen bg-bg text-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-200">Checking access...</p>
        </div>
      </div>
    );
  }

  // Access denied screen for non-team members
  if (!user || !isTeamMember) {
    return (
      <div className="min-h-screen bg-bg text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 border-2 border-red-500/50 rounded-full flex items-center justify-center text-5xl">
            🚫
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-linear-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Access Denied
          </h1>
          <p className="text-cyan-200 mb-6">
            You don't have permission to access the Review Dashboard. This area is restricted to team members only.
          </p>
          {!user && (
            <p className="text-cyan-300/60 mb-6 text-sm">
              Please sign in with a team member account.
            </p>
          )}
          {onClose && (
            <Button onClick={onClose} variant="primary" size="lg">
              Back to Site
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async (documentId: string, status: 'approved' | 'rejected') => {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      alert('Missing database configuration');
      return;
    }

    try {
      setUpdating(documentId);
      await updateProfileStatus(DB_ID, PROFILE_TABLE_ID, documentId, status);
      await fetchProfiles(); // Refresh the list
    } catch (error: any) {
      alert(error?.message || 'Failed to update profile status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteProfile = async (documentId: string) => {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      alert('Missing database configuration');
      return;
    }

    try {
      setDeleting(documentId);
      await deleteProfile(DB_ID, PROFILE_TABLE_ID, documentId);
      await fetchProfiles(); // Refresh the list
      setDeleteConfirm(null); // Close confirmation modal
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete profile';
      
      // Check if it's a permissions error
      if (errorMessage.includes('not authorized') || errorMessage.includes('permission') || error?.code === 401 || error?.code === 403) {
        alert(
          `Permission Error: This profile was created before team permissions were added.\n\n` +
          `To fix this:\n` +
          `1. Go to your Appwrite Console\n` +
          `2. Navigate to the profile in your database\n` +
          `3. Update the document permissions to include your Review Team (ID: ${import.meta.env.VITE_REVIEW_TEAM_ID || 'Not configured'})\n` +
          `4. Add delete permission for the team\n\n` +
          `New profiles will work automatically.`
        );
      } else {
        alert(`Failed to delete profile: ${errorMessage}`);
      }
    } finally {
      setDeleting(null);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (filter === 'all') return true;
    return profile.status === filter;
  });

  const statusCounts = {
    all: profiles.length,
    pending: profiles.filter((p) => p.status === 'pending').length,
    approved: profiles.filter((p) => p.status === 'approved').length,
    rejected: profiles.filter((p) => p.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-cyan-200">Loading profiles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                Profile Review Dashboard
              </h1>
              <p className="text-cyan-200">Review and manage submitted studio profiles</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="h-10 px-4 border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)]"
              >
                Back to Site
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === status
                    ? 'bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] shadow-[0_8px_22px_rgba(34,211,238,0.35)]'
                    : 'bg-[rgba(20,28,42,0.6)] border border-white/8 text-cyan-100 hover:bg-[rgba(0,229,255,0.08)]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Profiles List */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold mb-2">No profiles found</h3>
            <p className="text-cyan-200">
              {filter === 'pending' ? 'No pending profiles to review' : `No ${filter} profiles`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.$id}
                className="bg-[rgba(20,28,42,0.6)] backdrop-blur-[10px] border border-white/8 rounded-2xl p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
                        <p className="text-cyan-200 mb-3">{profile.tagline}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          profile.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : profile.status === 'approved'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {profile.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                        <span className="text-cyan-400 text-xs font-semibold block mb-1">Genre</span>
                        <span className="font-semibold text-white">{profile.genre}</span>
                      </div>
                      <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                        <span className="text-cyan-400 text-xs font-semibold block mb-1">Platform</span>
                        <span className="font-semibold text-white">{profile.platform}</span>
                      </div>
                      <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                        <span className="text-cyan-400 text-xs font-semibold block mb-1">Team Size</span>
                        <span className="font-semibold text-white">{profile.teamSize}</span>
                      </div>
                      <div className="bg-[rgba(0,229,255,0.08)] border border-cyan-500/15 rounded-lg p-3">
                        <span className="text-cyan-400 text-xs font-semibold block mb-1">Location</span>
                        <span className="font-semibold text-white">{profile.location}</span>
                      </div>
                    </div>

                    {profile.description && (
                      <div className="mb-4">
                        <span className="text-cyan-400 text-sm font-semibold block mb-1">Description</span>
                        <p className="text-cyan-100 text-sm">{profile.description}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-cyan-400">Email: </span>
                        <span className="text-white">{profile.email}</span>
                      </div>
                      {profile.website && (
                        <div>
                          <span className="text-cyan-400">Website: </span>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:text-cyan-100"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="text-cyan-400">Submitted: </span>
                        <span className="text-white">{profile.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-48 flex lg:flex-col gap-3">
                    {/* Approve/Reject buttons - Only for pending profiles */}
                    {profile.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => handleStatusUpdate(profile.$id, 'approved')}
                          disabled={updating === profile.$id || deleting === profile.$id}
                          loading={updating === profile.$id}
                          fullWidth
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(profile.$id, 'rejected')}
                          disabled={updating === profile.$id || deleting === profile.$id}
                          loading={updating === profile.$id}
                          fullWidth
                        >
                          ✕ Reject
                        </Button>
                      </>
                    )}
                    {/* Delete button - Available for all profiles */}
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirm(profile)}
                      disabled={updating === profile.$id || deleting === profile.$id}
                      loading={deleting === profile.$id}
                      fullWidth
                      className="border-red-500/50 text-red-300 hover:bg-red-500/10 hover:border-red-500"
                    >
                      🗑️ Delete Permanently
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[rgba(20,28,42,0.95)] border border-white/8 rounded-2xl p-6 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 border-2 border-red-500/50 rounded-full flex items-center justify-center text-3xl">
                🗑️
              </div>
              <h3 className="text-2xl font-bold mb-2 text-red-300">Delete Profile Permanently?</h3>
              <p className="text-cyan-200 mb-4">
                Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.name}</span>?
              </p>
              <p className="text-red-300/80 text-sm mb-6">
                This action cannot be undone. The profile will be permanently removed from the database and will no longer appear on the website.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                fullWidth
                disabled={deleting === deleteConfirm.$id}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteProfile(deleteConfirm.$id)}
                fullWidth
                loading={deleting === deleteConfirm.$id}
                className="bg-red-600 hover:bg-red-700 border-red-600"
              >
                {deleting === deleteConfirm.$id ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

