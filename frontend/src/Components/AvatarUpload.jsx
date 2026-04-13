import React, { useState } from 'react';
import { supabase } from '../Services/supabaseClient';

function AvatarUpload ({ onUploadSuccess, currentImageUrl }) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert("File is too large. Please select an image smaller than 8MB.");
            return;
        }

        setPreviewUrl(URL.createObjectURL(file));

        try {
            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`; // Folder path for SQL security policies

            // 1. Upload file to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);
            
            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            onUploadSuccess(data.publicUrl);

        } catch (error) {
            console.error(error);
            alert ('Error uploading image!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={styles.avatarContainer}>
            <div style={styles.circle}>
                {previewUrl ? (
                    <img src={previewUrl} alt='Avatar' style={styles.image} />
                ) : (
                    <span style={{ color: '#888', fontSize: '12px' }}>No Photo</span>
                )}
            </div>
            <label style={styles.uploadLabel}>
                {uploading ? 'Uploading...' : 'Change Photo'}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    style={{ display: 'none' }} 
                />
            </label>
        </div>
    );
}

const styles = {
    avatarContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
    circle: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        border: '2px solid #ddd',
        marginBottom: '10px'
    },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    uploadLabel: { 
        fontSize: '14px', 
        color: '#007bff', 
        cursor: 'pointer', 
        textDecoration: 'underline' 
    }
};

export default AvatarUpload;