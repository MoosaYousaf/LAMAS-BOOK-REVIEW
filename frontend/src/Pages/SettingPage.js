import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNav from '../Components/SidebarNav';
import { supabase } from '../Services/supabaseClient';
import AvatarUpload from '../Components/AvatarUpload';

function SettingPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    bio: '',
    is_private: false,
    avatar_url: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('Profiles')
        .select('username, full_name, bio, is_private, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        setErrorMsg('Unable to load settings. Please try again.');
      } else {
        setProfile({
          username: data?.username || '',
          full_name: data?.full_name || '',
          bio: data?.bio || '',
          is_private: !!data?.is_private,
          avatar_url: data?.avatar_url || '',
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (/\s/.test(profile.username)) {
      setErrorMsg('Username cannot contain spaces.');
      return;
    }

    setSavingProfile(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg('No active session found. Please sign in again.');

      setSavingProfile(false);
      return;
    }

    const { error } = await supabase
      .from('Profiles')
      .update({
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        is_private: profile.is_private,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setErrorMsg(error.message.includes('unique')
        ? 'That username is already taken.'
        : `Error saving settings: ${error.message}`);
    } else {
      setSuccessMsg('Profile settings updated.');
    }

    setSavingProfile(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMsg('');

    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword || !confirmPassword) {
      setPasswordMsg('Please fill out both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z]).{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordMsg('Password must be at least 12 characters and include one capital letter.');
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMsg(`Error updating password: ${error.message}`);
    } else {
      setPasswordMsg('Password updated successfully.');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    }

    setSavingPassword(false);
  };

  const handleAvatarUploaded = async (avatarUrl) => {
    setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('Profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      setErrorMsg(`Avatar upload succeeded but profile update failed: ${error.message}`);
    } else {
      setSuccessMsg('Profile picture updated.');
    }
  };


  const handleAvatarRemove = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setProfile((prev) => ({ ...prev, avatar_url: '' }));

    const { error } = await supabase
      .from('Profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      setErrorMsg(`Error removing profile picture: ${error.message}`);
    } else {
      setSuccessMsg('Profile picture removed.');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading settings...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <SidebarNav />

      <main style={{ flex: 1, padding: '30px 40px' }}>
        <h1 style={{ marginTop: 0 }}>Settings</h1>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
        {successMsg && <p style={styles.success}>{successMsg}</p>}

        <form onSubmit={handleProfileSave} style={styles.card}>
          <h2 style={styles.sectionTitle}>Profile Settings</h2>

          <AvatarUpload
            currentImageUrl={profile.avatar_url}
            onUploadSuccess={handleAvatarUploaded}
          />

          <button
            type="button"
            onClick={handleAvatarRemove}
            style={styles.secondaryBtn}
          >
            Remove Photo
          </button>

          <label style={styles.label}>Username</label>
          <input
            type="text"
            required
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            style={styles.input}
          />
          <ul style={styles.helpText}>
            <li>Must be unique</li>
            <li>No spaces allowed</li>
          </ul>

          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            style={styles.input}
          />

          <label style={styles.label}>Bio</label>
          <textarea
            maxLength="250"
            placeholder="Max 250 characters..."
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            style={{ ...styles.input, minHeight: '88px', resize: 'vertical' }}
          />
          <p style={styles.charCount}>{profile.bio.length}/250</p>

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={profile.is_private}
              onChange={(e) => setProfile({ ...profile, is_private: e.target.checked })}
            />
            Make Account Private
          </label>

          <button type="submit" style={styles.submitBtn} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile Settings'}
          </button>
        </form>

        <form onSubmit={handlePasswordSave} style={styles.card}>
          <h2 style={styles.sectionTitle}>Change Password</h2>

          <label style={styles.label}>New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            style={styles.input}
            required
          />

          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            style={styles.input}
            required
          />

          <div style={styles.helpText}>
            <p>Password must have:</p>
            <ul>
              <li>At least 12 characters</li>
              <li>At least one capital letter</li>
            </ul>
          </div>

          {passwordMsg && <p style={styles.info}>{passwordMsg}</p>}

          <button type="submit" style={styles.submitBtn} disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </main>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '560px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionTitle: { margin: '0 0 8px 0' },
  label: { fontSize: '14px', fontWeight: 'bold', marginTop: '8px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' },
  helpText: { fontSize: '12px', color: '#666', marginTop: '-2px' },
  charCount: { fontSize: '12px', color: '#666', textAlign: 'right', margin: 0 },
  checkboxLabel: { fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' },
  submitBtn: { padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '6px', fontWeight: 'bold' },
  secondaryBtn: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '5px', background: '#fff', cursor: 'pointer', width: 'fit-content' },
  error: { color: '#8b0000', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '6px', maxWidth: '560px' },
  success: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '6px', maxWidth: '560px' },
  info: { color: '#333', backgroundColor: '#f4f4f4', padding: '8px', borderRadius: '6px', fontSize: '13px' },
};

export default SettingPage;