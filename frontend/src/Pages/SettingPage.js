import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNav from '../Components/SidebarNav';
import { supabase } from '../Services/supabaseClient';
import AvatarUpload from '../Components/AvatarUpload';
import '../Styles/variables.css';
import '../Styles/theme.css';
import '../Styles/Pages/SettingsPage.css';

function SettingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');

    const [profile, setProfile] = useState({ username: '', full_name: '', bio: '', is_private: false, avatar_url: '' });
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) { navigate('/'); return; }

            const { data, error } = await supabase
                .from('Profiles').select('username, full_name, bio, is_private, avatar_url')
                .eq('id', user.id).single();

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
        setSuccessMsg(''); setErrorMsg('');
        if (/\s/.test(profile.username)) { setErrorMsg('Username cannot contain spaces.'); return; }
        setSavingProfile(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setErrorMsg('No active session. Please sign in again.'); setSavingProfile(false); return; }
        // Include avatar_url so avatar changes are persisted on Save
        const { error } = await supabase.from('Profiles').update({
            username: profile.username, full_name: profile.full_name,
            bio: profile.bio, is_private: profile.is_private,
            avatar_url: profile.avatar_url, updated_at: new Date().toISOString(),
        }).eq('id', user.id);
        if (error) {
            setErrorMsg(error.message.includes('unique') ? 'That username is already taken.' : `Error: ${error.message}`);
        } else {
            setSuccessMsg('Profile settings updated.');
        }
        setSavingProfile(false);
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setPasswordMsg('');
        const { newPassword, confirmPassword } = passwordData;
        if (!newPassword || !confirmPassword) { setPasswordMsg('Please fill out both password fields.'); return; }
        if (newPassword !== confirmPassword) { setPasswordMsg('Passwords do not match.'); return; }
        if (!/^(?=.*[A-Z]).{12,}$/.test(newPassword)) {
            setPasswordMsg('Password must be at least 12 characters with one capital letter.'); return;
        }
        setSavingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) { setPasswordMsg(`Error: ${error.message}`); }
        else { setPasswordMsg('Password updated successfully.'); setPasswordData({ newPassword: '', confirmPassword: '' }); }
        setSavingPassword(false);
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) { setErrorMsg(`Unable to log out: ${error.message}`); setLoggingOut(false); return; }
        navigate('/');
    };

    // Only updates local state; DB write happens when Save is clicked
    const handleAvatarUploaded = (avatarUrl) => {
        setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
    };

    // Resets avatar to auto-generated dicebear URL; DB write happens on Save
    const handleAvatarRemove = () => {
        const dicebearUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${profile.username}`;
        setProfile(prev => ({ ...prev, avatar_url: dicebearUrl }));
    };

    if (loading) return <div className="pg-loading">Loading settings...</div>;

    return (
        <div className="pg-wrap">
            <div className="pg-bg" />
            <SidebarNav />

            <div className="pg-main">
                <div className="settings-content">
                    <h1 className="settings-page-title">Settings</h1>

                    {errorMsg && <p className="settings-msg settings-msg--error">{errorMsg}</p>}
                    {successMsg && <p className="settings-msg settings-msg--success">{successMsg}</p>}

                    {/* Profile settings */}
                    <form onSubmit={handleProfileSave} className="glass settings-card">
                        <p className="settings-card__title">Profile Settings</p>

                        <AvatarUpload currentImageUrl={profile.avatar_url} onUploadSuccess={handleAvatarUploaded} />

                        {profile.avatar_url && !profile.avatar_url.startsWith('https://api.dicebear.com/9.x/initials/svg?seed=') && (
                            <button type="button" onClick={handleAvatarRemove} className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: '12px', padding: '8px 14px' }}>
                                Remove Photo
                            </button>
                        )}

                        <div>
                            <label className="glass-label">Username</label>
                            <input type="text" required value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                className="glass-input" />
                            <ul className="settings-help" style={{ marginTop: '6px', paddingLeft: '18px' }}>
                                <li>Must be unique</li>
                                <li>No spaces allowed</li>
                            </ul>
                        </div>

                        <div>
                            <label className="glass-label">Full Name</label>
                            <input type="text" value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="glass-input" />
                        </div>

                        <div>
                            <label className="glass-label">Bio</label>
                            <textarea maxLength="250" placeholder="Max 250 characters..."
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="glass-textarea" />
                            <p className="settings-char-count">{profile.bio.length}/250</p>
                        </div>

                        <label className="glass-checkbox-label">
                            <input type="checkbox" checked={profile.is_private}
                                onChange={(e) => setProfile({ ...profile, is_private: e.target.checked })} />
                            Make Account Private
                        </label>

                        <button type="submit" className="btn btn-copper" disabled={savingProfile} style={{ padding: '13px', fontSize: '14px' }}>
                            {savingProfile ? 'Saving...' : 'Save Profile Settings'}
                        </button>
                    </form>

                    {/* Change password */}
                    <form onSubmit={handlePasswordSave} className="glass settings-card">
                        <p className="settings-card__title">Change Password</p>

                        <div>
                            <label className="glass-label">New Password</label>
                            <input type="password" value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="glass-input" required />
                        </div>

                        <div>
                            <label className="glass-label">Confirm New Password</label>
                            <input type="password" value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="glass-input" required />
                        </div>

                        <ul className="settings-help" style={{ paddingLeft: '18px', margin: 0 }}>
                            <li>At least 12 characters</li>
                            <li>At least one capital letter</li>
                        </ul>

                        {passwordMsg && (
                            <p className={`settings-msg ${passwordMsg.includes('successfully') ? 'settings-msg--success' : 'settings-msg--info'}`}>
                                {passwordMsg}
                            </p>
                        )}

                        <button type="submit" className="btn btn-copper" disabled={savingPassword} style={{ padding: '13px', fontSize: '14px' }}>
                            {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    {/* Session */}
                    <section className="glass settings-card">
                        <p className="settings-card__title">Session</p>
                        <p className="settings-help">Sign out of your account on this device.</p>
                        <button type="button" className="btn btn-danger" onClick={handleLogout} disabled={loggingOut}
                            style={{ alignSelf: 'flex-start', padding: '12px 24px', fontSize: '14px' }}>
                            {loggingOut ? 'Logging out...' : 'Log Out'}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default SettingPage;
