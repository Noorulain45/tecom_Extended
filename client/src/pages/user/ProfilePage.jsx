import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({
        name: profile.name,
        phone: profile.phone,
        address: { street: profile.street, city: profile.city, state: profile.state, zipCode: profile.zipCode, country: profile.country },
      });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-tea-200 rounded-full flex items-center justify-center text-2xl font-bold text-tea-800">
          {user?.name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl text-tea-900">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`badge text-xs mt-1 ${user?.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : user?.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-tea-100 mb-6">
        {['profile', 'security'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-tea-600 text-tea-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input" placeholder="+91 98765 43210" />
          </div>
          <div className="border-t border-tea-100 pt-5">
            <h3 className="font-medium text-gray-700 mb-4">Default Shipping Address</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Street</label>
                <input value={profile.street} onChange={(e) => setProfile({ ...profile, street: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">City</label>
                  <input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">State</label>
                  <input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">ZIP</label>
                  <input value={profile.zipCode} onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Country</label>
                  <input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="input" />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePasswordChange} className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required className="input" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
            <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} className="input" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required className="input" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3">{saving ? 'Changing...' : 'Change Password'}</button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
