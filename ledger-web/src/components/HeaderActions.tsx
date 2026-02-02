"use client";

import Link from "next/link";
import styles from "../app/events/events.module.css"; // Reuse existing styles or import separate
import { useAuth } from "@/context/AuthContext";

export default function HeaderActions() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            {isAuthenticated ? (
                <Link href="/dashboard" className={styles.backLink}>
                    Back to Dashboard
                </Link>
            ) : (
                <Link href="/" className={styles.backLink}>
                    ← Back to Home
                </Link>
            )}
        </>
    );
}
