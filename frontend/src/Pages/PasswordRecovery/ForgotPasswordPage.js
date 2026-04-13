import React, { useState } from 'react';
import { supabase } from '../../Services/supabaseClient';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState('');
    const [message, setMessage] = useState('');

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/resetPassword',
        });

        if (error) {
            alert(error.message);
        } else {
            setMessage("Check your email for the password reset link!");
        }
        setLoading(false);
    }

    return(
        <div style={styles.container}>
            <h2>Reset Your Password</h2>
            <p style={{fontSize: '14px', color: '#666', textAlign: 'center'}}>
                Enter your email and we'll send you a link to get back into your account.
            </p>
            {message ? (
                <p style={{ color: 'green', fontWeight: 'bold' }}></p>
            ) : (
                <form onSubmit={handleResetRequest} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        style={styles.input}
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            )}
        </div>
    );
}

const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif', padding: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', width: '350px' },
    input: { padding: '12px', borderRadius: '5px', border: '1px solid #ccc' },
    submitBtn: { padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
}

export default ForgotPasswordPage;
