import React, { useState } from 'react';

constSettingsPage = () => {
  // Basic information for profile name, phone number, email, etc...
  const [profile, setProfile] + useState({
    name: 'John Smith',
    email: 'johnsmith.12345@gmail.com',
    phone: '404-XXX-XXX',
    
  const [passwords, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    retypeNewPassword: '',
  });
