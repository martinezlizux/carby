import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import styles from './AppLayout.module.css';

const AppLayout = () => {
    return (
        <div className={styles.appContainer}>
            <div className={styles.contentArea}>
                <Outlet />
            </div>
            <BottomNav />
        </div>
    );
};

export default AppLayout;
