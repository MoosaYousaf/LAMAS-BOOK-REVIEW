import React, { useState } from 'react';
import { supabase } from '../../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        const passwordRedex = /^(?=.*[A-Z]).{12,}$/;
        if (!passwordRedex.test(password)) {
            alert("Password must be 12 + characters and have one capital letter.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            AudioListener(error.message);
        } else {
            alert("Password updated successfully!");
            navigate('/login');
        }

        setLoading(false);
    }

    return (
        <div style={styles.container}>
            <h2>Create New Password</h2>
            <form onSubmit={handlePasswordUpdate} style={styles.form}>
                <input
                    type="password"
                    placeholder="New Password"
                    required
                    style={styles.input}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div style={styles.helpText}>
                    <p>Password must have:</p>
                    <ul>
                        <li>At least 12 characters</li>
                        <li>At least one capital letter</li>
                    </ul>
                </div>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', width: '350px' },
    input: { padding: '12px', borderRadius: '5px', border: '1px solid #ccc' },
    helpText: { fontSize: '12px', color: '#888', marginTop: '-10px' },
    submitBtn: { padding: '12px', backgroundColor: '#000', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ResetPasswordPage;
