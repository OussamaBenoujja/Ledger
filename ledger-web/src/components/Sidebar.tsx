"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    return (
        <aside className={styles.sidebar}>
            <div className={styles.top}>
                <div className={styles.logo}>
                    Ledger
                </div>

                <div className={styles.user}>
                    <div className={styles.avatar}>
                        {(user?.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.email}>{user?.email}</span>
                        <span className={styles.role}>{user?.role.toLowerCase()}</span>
                    </div>
                </div>
            </div>

            <nav className={styles.nav}>
                <Link
                    href="/dashboard"
                    className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}
                >
                    Dashboard
                </Link>

                <Link
                    href="/events"
                    className={`${styles.link} ${isActive('/events') ? styles.active : ''}`}
                >
                    Browse Events
                </Link>

                {user?.role === 'ADMIN' && (
                    <Link
                        href="/admin/events"
                        className={`${styles.link} ${isActive('/admin') ? styles.active : ''}`}
                    >
                        Admin Panel
                    </Link>
                )}
            </nav>

            <div className={styles.footer}>
                <button onClick={logout} className={styles.logoutBtn}>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
