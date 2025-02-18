'use client';

import { useState, useEffect } from 'react';
import { 
  updateUserProfile, 
  createDetailedUserProfile, 
  updateUserPreferences 
} from '../../lib/firebaseService';
import useUserStore from '../../stores/userStore';
import Navbar from '../../components/Navbar';

export default function ProfilePage() {
  const { user } = useUserStore();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    bio: '',
    location: '',
    photoURL: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      website: ''
    }
  });
  const [preferences, setPreferences] = useState({
    marketingOptIn: false,
    accountType: 'free'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      // Populate form with existing user data
      setProfile({
        displayName: user.displayName || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        photoURL: user.photoURL || '',
        socialLinks: user.socialLinks || {
          twitter: '',
          linkedin: '',
          website: ''
        }
      });

      setPreferences({
        marketingOptIn: user.marketingOptIn || false,
        accountType: user.accountType || 'free'
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await updateUserProfile(user.uid, profile);
      const updatedPreferences = await updateUserPreferences(user.uid, preferences);
      
      // Combine updated data
      setProfile(updatedProfile);
      setPreferences(updatedPreferences);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const updatedProfile = await updateUserProfile(user.uid, {
          photoURL: reader.result
        });
        setProfile(prevProfile => ({
          ...prevProfile,
          photoURL: updatedProfile.photoURL
        }));
      } catch (err) {
        setError('Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 bg-gray-100 flex items-center">
            <div className="relative">
              <img 
                src={profile.photoURL || '/default-avatar.png'} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover"
              />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-image-upload"
              />
              <label 
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer"
              >
                📷
              </label>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {profile.displayName || 'User Profile'}
              </h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileUpdate} className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 font-bold mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                disabled={!isEditing}
              />
            </div>

            {/* Social Links */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Twitter</label>
                <input
                  type="text"
                  value={profile.socialLinks.twitter}
                  onChange={(e) => setProfile({
                    ...profile, 
                    socialLinks: {
                      ...profile.socialLinks, 
                      twitter: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">LinkedIn</label>
                <input
                  type="text"
                  value={profile.socialLinks.linkedin}
                  onChange={(e) => setProfile({
                    ...profile, 
                    socialLinks: {
                      ...profile.socialLinks, 
                      linkedin: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Website</label>
                <input
                  type="text"
                  value={profile.socialLinks.website}
                  onChange={(e) => setProfile({
                    ...profile, 
                    socialLinks: {
                      ...profile.socialLinks, 
                      website: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Preferences</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketingOptIn}
                  onChange={(e) => setPreferences({
                    ...preferences, 
                    marketingOptIn: e.target.checked
                  })}
                  className="mr-2"
                  disabled={!isEditing}
                />
                <label className="text-gray-700">Opt-in for marketing communications</label>
              </div>
            </div>

            {/* Error Handling */}
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 