// AvatarUpload — a profile photo picker used on the account creation and settings pages.
// Uploads the selected image to the Supabase 'avatars' storage bucket under the
// user's own folder (user_id/filename) and calls onUploadSuccess with the public URL.
// The parent is responsible for saving that URL to the Profiles table.
//
// Files larger than 8 MB are rejected before the upload is attempted to avoid
// hitting Supabase's storage limits and to give the user immediate feedback.

import React, { useEffect, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import '../Styles/authentication.css';

function AvatarUpload({ onUploadSuccess, currentImageUrl }) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);

    // Sync preview when parent changes the URL (e.g. remove photo)
    useEffect(() => {
        setPreviewUrl(currentImageUrl || null);
    }, [currentImageUrl]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert('File is too large. Please select an image smaller than 8MB.');
            return;
        }

        setPreviewUrl(URL.createObjectURL(file));

        try {
            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            onUploadSuccess(data.publicUrl);
        } catch (error) {
            console.error(error);
            alert('Error uploading image!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="auth-avatar-wrap">
            <div className="auth-avatar-circle">
                {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span className="auth-avatar-placeholder">No Photo</span>
                )}
            </div>
            <label className="auth-upload-label">
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

export default AvatarUpload;
