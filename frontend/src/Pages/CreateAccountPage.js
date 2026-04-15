import React, { useState, useEffect } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '../Components/AvatarUpload';

function CreateAccountPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [profile, setProfile] = useState({
        username: '',
        full_name: '',
        bio: '',
        is_private: false,
        avatar_url: ''
    });

    useEffect(() => {
        const checkStatus = async () => {
            // get authenticated user from supabase
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // if no user is logged in, they shouldn't be here
                navigate('/');
                return;
            }

            // check if a profile already exists for this ID
            // prevent "loop" if a google user lands here 
            const { data } = await supabase
                .from('Profiles')
                .select('is_onboarding_complete, full_name')
                .eq('id', user.id)
                .single();
            
            if (data?.is_onboarding_complete) {
                navigate('/dashboard');
                return;
            } else {
                setProfile(prev => ({
                    ...prev,
                    full_name: data?.full_name || user.user_metadata?.full_name || '',
                }));
            }

            setLoading(false);
        }

        checkStatus();
    }, [navigate]);

    const handleAvatarDone = (url) => {
        setProfile(prev => ({ 
            ...prev, 
            avatar_url: url
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        // validation: no spaces in username
        if (/\s/.test(profile.username)) {
            setErrorMsg("Username cannot contain spaces.");
            return;
        }

        // fetch user again to ensure session hasn't expired during form filling
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            setErrorMsg("No active session found. Please log in again.");
            return;
        }

        // user 'upsert' to create the profile record
        const { error } = await supabase
            .from('Profiles')
            .upsert({
                id: user.id, // Links Profile to the Auth user
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
            console.error("Upsert Error:", error);
            // handle unique constraint (username taken)
            setErrorMsg(error.message.includes("unique")
            ? "Username is already taken!"
            : "Error saving profile: " + error.message);
        } else {
            // success, user now has a profile, so dashboard will let them in
            navigate('/dashboard');
        }
    };

    if (loading) return <div style={styles.container}>Loading...</div>;

    return (
        <div style={styles.container}>
            <h2>Complete Your Profile</h2>
            {errorMsg && <p style={styles.error}>{errorMsg}</p>}

            {/* Call AvatarUpload Component */}
            <AvatarUpload onUploadSuccess={handleAvatarDone} />

            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Username (required)</label>
                <input
                    type="text"
                    required
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    style={styles.input} 
                />
                <ul style={styles.helpText}>
                    <li>Must be unique</li>
                    <li>No spaces allowed</li>
                </ul>

                <label style={styles.label}>Full Name (Optional)</label>
                <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    style={styles.input} 
                />

                <label style={styles.label}>Bio (Optional)</label>
                <textarea
                    maxLength="250"
                    placeholder="Max 250 Characters..."
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    style={{...styles.input, height: '80px', resize: 'none'}}
                />
                <p style={styles.charCount}>{profile.bio.length}/250</p>

                <label style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        //required
                        checked={profile.is_private}
                        onChange={(e) => setProfile({...profile, is_private: e.target.checked})} 
                    />
                    Make Account Private (Changeable in Settings)
                </label>

                <button type="submit" style={styles.submitBtn}>Save and Continue</button>
            </form>
        </div>
    );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', fontFamily: 'Arial, sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', width: '320px' },
  label: { fontSize: '14px', fontWeight: 'bold', marginTop: '10px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' },
  helpText: { fontSize: '11px', color: '#888', marginTop: '-5px', marginBottom: '5px' },
  charCount: { fontSize: '11px', color: '#888', textAlign: 'right' },
  checkboxLabel: { fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '13px', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px', width: '320px', textAlign: 'center' },
  submitBtn: { padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' }
};

export default CreateAccountPage;