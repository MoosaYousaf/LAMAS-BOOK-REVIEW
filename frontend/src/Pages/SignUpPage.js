import React, { useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        // 12 Chars + 1 Captial Letter
        const passwordRegex = /^(?=.*[A-Z]).{12,}$/;
        if (!passwordRegex.test(password)) {
            alert("Password does not meet requirements.");
            return;
        }

        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                // Sends user to profile setup page after they click the email link
                emailRedirectTo: window.location.origin + '/createAccount',
            }
        });

        if (error) { 
            alert(error.message); 
        } else {
            navigate('/createAccount');
        }

    };

    return (
        <div style={styles.container}>
            <h2>Join LAMAS BOOK REVIEW</h2>
            <form onSubmit={handleSignup} style={styles.form}>
                <input 
                    type="email" 
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div style={styles.helpText}>
                    <p>Password must have:</p>
                    <ul>
                        <li>At least 12 characters</li>
                        <li>At least one capital letter</li>
                    </ul>
                </div>

                <button type="submit" style={styles.submitBtn}>Sign Up</button>
            </form>
        </div>
    );
}

const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', width: '350px' },
    helpText: { fontSize: '12px', color: '#888', marginTop: '-10px', listStyleType: 'circle' },
    submitBtn: { padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default SignUpPage;