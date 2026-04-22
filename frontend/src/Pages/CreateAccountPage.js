import React, { useState, useEffect } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '../Components/AvatarUpload';
import '../Styles/variables.css';
import '../Styles/authentication.css';

function CreateAccountPage() {
    const navigate = useNavigate();

    // Page state
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Form fields
    const [profile, setProfile] = useState({
        username: '',
        full_name: '',
        bio: '',
        is_private: false,
        avatar_url: ''
    });

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/'); return; }

            // Redirect if onboarding already done (e.g. Google sign-in users)
            const { data } = await supabase
                .from('Profiles')
                .select('is_onboarding_complete, full_name, avatar_url')
                .eq('id', user.id)
                .single();

            if (data?.is_onboarding_complete) {
                navigate('/dashboard');
                return;
            }

            setProfile(prev => ({
                ...prev,
                full_name: data?.full_name || user.user_metadata?.full_name || '',
                avatar_url: data?.avatar_url || '',
            }));

            setLoading(false);
        };

        checkStatus();
    }, [navigate]);

    // Save avatar URL to local state; DB write happens on submit
    const handleAvatarDone = (url) => {
        setProfile(prev => ({ ...prev, avatar_url: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (/\s/.test(profile.username)) {
            setErrorMsg('Username cannot contain spaces.');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setErrorMsg('No active session found. Please log in again.'); return; }

        const { error } = await supabase
            .from('Profiles')
            .upsert({
                id: user.id,
                username: profile.username,
                full_name: profile.full_name,
                bio: profile.bio,
                is_private: profile.is_private,
                avatar_url: profile.avatar_url,
                is_onboarding_complete: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            setErrorMsg(error.message.includes('unique')
                ? 'Username is already taken!'
                : 'Error saving profile: ' + error.message);
        } else {
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="pg-loading">Loading...</div>;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Complete Your Profile</h2>

                {errorMsg && <p className="auth-error">{errorMsg}</p>}

                <AvatarUpload onUploadSuccess={handleAvatarDone} currentImageUrl={profile.avatar_url} />

                <form onSubmit={handleSubmit} className="auth-form">
                    <div>
                        <label className="auth-label">Username (required)</label>
                        <input
                            type="text"
                            required
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            className="auth-input"
                            placeholder="e.g. bookworm42"
                        />
                        <div className="auth-help-text" style={{ marginTop: '6px' }}>
                            <ul>
                                <li>Must be unique</li>
                                <li>No spaces allowed</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <label className="auth-label">Full Name (optional)</label>
                        <input
                            type="text"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            className="auth-input"
                            placeholder="Your display name"
                        />
                    </div>

                    <div>
                        <label className="auth-label">Bio (optional)</label>
                        <textarea
                            maxLength="250"
                            placeholder="Max 250 characters..."
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            className="auth-input"
                            style={{ height: '80px', resize: 'none' }}
                        />
                        <p className="auth-char-count">{profile.bio.length}/250</p>
                    </div>

                    <label className="auth-checkbox-label">
                        <input
                            type="checkbox"
                            checked={profile.is_private}
                            onChange={(e) => setProfile({ ...profile, is_private: e.target.checked })}
                        />
                        Make Account Private (changeable in Settings)
                    </label>

                    <div className="auth-button-full">
                        <button type="submit" className="auth-button auth-primary-button" style={{ width: '100%' }}>
                            Save and Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateAccountPage;
