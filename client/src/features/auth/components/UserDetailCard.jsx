import React from 'react';
import { useSelector } from 'react-redux';
import '../styles/_user-detail-card.scss';

const UserDetailCard = () => {
    const user = useSelector((state) => state.auth.user);

    const initials = user?.username
        ? user.username.slice(0, 1).toUpperCase()
        : '?';

    return (
        <div className="user-detail-card">
            <div className="user-avatar">{initials}</div>
            <p className="user-name">{user?.username ?? 'Guest'}</p>
        </div>
    );
};

export default UserDetailCard;
