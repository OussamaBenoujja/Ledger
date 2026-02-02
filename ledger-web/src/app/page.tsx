"use client";

import styles from "./page.module.css";
import Link from 'next/link';
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {

    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Welcome to Ledger</h1>
      <p className={styles.description}>Event Management System</p>

      <div className={styles.actions}>
        <Link href="/events" className={styles.button}>Browse Events</Link>

        {!isLoading && isAuthenticated ? (
          <Link href="/dashboard" className={styles.link}>Go to Dashboard</Link>
        ) : (
          <Link href="/login" className={styles.link}>Login</Link>
        )}
      </div>
    </main>
  );
}
