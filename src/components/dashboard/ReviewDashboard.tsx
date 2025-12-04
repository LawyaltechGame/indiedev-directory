import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTeamMember } from '../../hooks/useTeamMember';
import { getAllProfiles, updateProfileStatus, deleteProfile, createProfileDocument } from '../../services/profile';
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
  createdByTeam?: boolean;
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
  const [rejectModal, setRejectModal] = useState<Profile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [sendingReject, setSendingReject] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

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
      
      // Send approval email only if profile was NOT created by team
      if (status === 'approved') {
        const profile = profiles.find(p => p.$id === documentId);
        if (profile && !profile.createdByTeam) {
          await sendApprovalEmail({
            email: profile.email,
            name: profile.name
          });
        }
      }
      
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

  const handleRejectWithReason = async (documentId: string, reason: string) => {
    if (!DB_ID || !PROFILE_TABLE_ID) {
      alert('Missing database configuration');
      return;
    }

    try {
      setUpdating(documentId);
      // First update the profile status to rejected
      await updateProfileStatus(DB_ID, PROFILE_TABLE_ID, documentId, 'rejected');
      
      // Then send notification email (we'll implement this logic here)
      const profile = profiles.find(p => p.$id === documentId);
      if (profile) {
        // Send email using FormSubmit
        await sendRejectionEmail({
          email: profile.email, // Using profile email for now
          name: profile.name,
          reason: reason
        });
      }
      
      await fetchProfiles(); // Refresh the list
    } catch (error: any) {
      alert(error?.message || 'Failed to reject profile');
    } finally {
      setUpdating(null);
    }
  };

  // Function to send approval email using FormSubmit
  const sendApprovalEmail = async (params: {
    email: string;
    name: string;
  }) => {
    const { email, name } = params;
    
    try {
      const formBody = new URLSearchParams();
      formBody.append('_subject', 'Game Centralen Profile Approved! 🎉');
      formBody.append('name', name);
      formBody.append('email', email);
      formBody.append('message', `Dear ${name},

Congratulations! Your profile submission to Game Centralen has been approved! 🎉

Your studio is now live and visible in our directory. Gamers and developers from around the world can now discover your work.

You can view your profile on our website at: https://gamecentralen.com

Thank you for being part of the Game Centralen community!

Best regards,
The Game Centralen Team`);

      const response = await fetch('https://formsubmit.co/cryptotrader035@gmail.com', {
        method: 'POST',
        body: formBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const text = await response.text();
      
      if (response.ok || text.includes('Thank you') || text.includes('success') || !text.startsWith('<!DOCTYPE')) {
        console.log('Approval email sent successfully');
      } else {
        console.error('FormSubmit response:', text);
        throw new Error('Failed to send email - received error page');
      }
    } catch (error) {
      console.error('Error sending approval email:', error);
      // We don't throw the error here because we don't want to fail the approval if email sending fails
    }
  };

  // Function to send rejection email using FormSubmit
  const sendRejectionEmail = async (params: {
    email: string;
    name: string;
    reason: string;
  }) => {
    const { email, name, reason } = params;
    
    try {
      // Using FormSubmit to send the email
      const formBody = new URLSearchParams();
      formBody.append('_subject', 'Game Centralen Profile Rejection - Please Resubmit');
      formBody.append('name', name);
      formBody.append('email', email);
      formBody.append('message', `Dear ${name},

We regret to inform you that your profile submission to Game Centralen has been rejected for the following reason:

${reason}

Please correct the issues mentioned above and resubmit your profile for review.

If you have any questions or need clarification, please feel free to reach out to us.

Best regards,
The Game Centralen Team`);

      // Send from cryptotrader035@gmail.com
      const response = await fetch('https://formsubmit.co/cryptotrader035@gmail.com', {
        method: 'POST',
        body: formBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // FormSubmit often returns HTML on success
      const text = await response.text();
      
      // Check if response indicates success
      if (response.ok || text.includes('Thank you') || text.includes('success') || !text.startsWith('<!DOCTYPE')) {
        console.log('Rejection email sent successfully');
      } else {
        console.error('FormSubmit response:', text);
        throw new Error('Failed to send email - received error page');
      }
    } catch (error) {
      console.error('Error sending rejection email:', error);
      // We don't throw the error here because we don't want to fail the profile rejection if email sending fails
    }
  };

  const handleCreateProfile = async (formData: any) => {
    if (!DB_ID || !PROFILE_TABLE_ID || !user) {
      alert('Missing configuration or user not logged in');
      return;
    }

    try {
      setCreating(true);
      await createProfileDocument({
        databaseId: DB_ID,
        tableId: PROFILE_TABLE_ID,
        userId: user.$id, // Use team member's ID
        data: formData,
        createdByTeam: true // Mark as created by team
      });
      
      setShowCreateModal(false);
      await fetchProfiles(); // Refresh the list
      alert('Profile created successfully and is now live!');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      alert(error?.message || 'Failed to create profile');
    } finally {
      setCreating(false);
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
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="h-10 px-4 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] rounded-xl font-extrabold transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
              >
                + Create Profile
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="h-10 px-4 border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 rounded-xl font-extrabold transition-all duration-200 hover:bg-[rgba(0,229,255,0.12)]"
                >
                  Back to Site
                </button>
              )}
            </div>
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
                          onClick={() => setRejectModal(profile)}
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

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[rgba(20,28,42,0.95)] border border-white/8 rounded-2xl p-6 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2 text-red-300">Reject Profile: {rejectModal.name}</h3>
              <p className="text-cyan-200 mb-4">Please state the reason(s) for rejecting this profile. The author will receive an email with these details.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={6}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-md p-3 placeholder:text-cyan-300"
                placeholder="Enter rejection reasons here..."
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                fullWidth
                disabled={sendingReject === rejectModal.$id}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    alert('Please provide a reason for rejection.');
                    return;
                  }
                  try {
                    setSendingReject(rejectModal.$id);
                    await handleRejectWithReason(rejectModal.$id, rejectReason.trim());
                    await fetchProfiles();
                  } catch (error: any) {
                    alert(error?.message || 'Failed to reject profile');
                  } finally {
                    setSendingReject(null);
                    setRejectModal(null);
                    setRejectReason('');
                  }
                }}
                fullWidth
                loading={sendingReject === rejectModal.$id}
                className="bg-red-600 hover:bg-red-700 border-red-600"
              >
                {sendingReject === rejectModal.$id ? 'Sending...' : 'Submit & Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreateModal && (
        <CreateProfileModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProfile}
          loading={creating}
        />
      )}
    </div>
  );
}

// Create Profile Modal Component
function CreateProfileModal({ onClose, onSubmit, loading }: { onClose: () => void; onSubmit: (data: any) => void; loading: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    genre: '',
    platform: '',
    teamSize: '',
    location: '',
    description: '',
    website: '',
    email: '',
    authEmail: '',
    tools: [] as string[],
    foundedYear: '',
    tags: [] as string[],
    revenue: 'F2P' // Default to F2P to satisfy Appwrite enum requirement
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.tagline || !formData.genre || !formData.platform || 
        !formData.teamSize || !formData.location || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[rgba(20,28,42,0.95)] border border-white/8 rounded-2xl p-6 max-w-2xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] my-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
            Create Studio Profile
          </h3>
          <p className="text-cyan-200 text-sm">
            Create a profile directly - it will be auto-approved and appear immediately in the directory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Studio Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                placeholder="Enter studio name"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value, authEmail: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                placeholder="studio@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-cyan-300 text-sm font-semibold mb-2">Tagline *</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
              placeholder="Brief description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Genre *</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                required
              >
                <option value="">Select genre</option>
                <option value="Action">Action</option>
                <option value="Adventure">Adventure</option>
                <option value="RPG">RPG</option>
                <option value="Strategy">Strategy</option>
                <option value="Simulation">Simulation</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Horror">Horror</option>
                <option value="Platformer">Platformer</option>
                <option value="Sports">Sports</option>
                <option value="Racing">Racing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Platform *</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                required
              >
                <option value="">Select platform</option>
                <option value="PC">PC</option>
                <option value="Console">Console</option>
                <option value="Mobile">Mobile</option>
                <option value="Web">Web</option>
                <option value="VR">VR</option>
                <option value="Multi-platform">Multi-platform</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Team Size *</label>
              <select
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                required
              >
                <option value="">Select team size</option>
                <option value="Solo">Solo</option>
                <option value="2-5">2-5</option>
                <option value="6-10">6-10</option>
                <option value="11-20">11-20</option>
                <option value="21-50">21-50</option>
                <option value="50+">50+</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                placeholder="City, Country"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Revenue Model *</label>
              <select
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                required
              >
                <option value="F2P">Free to Play (F2P)</option>
                <option value="Premium">Premium</option>
                <option value="Subscription">Subscription</option>
              </select>
            </div>

            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Founded Year</label>
              <input
                type="text"
                value={formData.foundedYear}
                onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
                placeholder="e.g., 2020"
              />
            </div>
          </div>

          <div>
            <label className="block text-cyan-300 text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
              placeholder="Tell us about the studio..."
            />
          </div>

          <div>
            <label className="block text-cyan-300 text-sm font-semibold mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-[rgba(0,0,0,0.4)] text-white border border-white/8 rounded-lg p-3"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

