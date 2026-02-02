"use client";

import { useAuth } from "@/context/AuthContext";
import { Event } from "@/types";
import { api } from "@/lib/api";
import { useState } from "react";
import styles from "./BookingActions.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingActions({ event }: { event: Event }) {
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleReserve = async () => {
        if (!confirm("Confirm your reservation?")) return;

        setLoading(true);
        setMessage(null);

        try {
            await api.post("/reservations", { eventId: event.id });
            setMessage({ type: "success", text: "Reservation successful! Check your dashboard for the ticket." });
            router.refresh(); // Refresh server data to update capacity
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to make reservation"
            });
        } finally {
            setLoading(false);
        }
    };

    const isFull = event.filled_participants >= event.capacity;

    if (!isAuthenticated) {
        return (
            <div className={styles.container}>
                <p>Please log in to reserve a seat.</p>
                <Link href={`/login?redirect=/events/${event.id}`} className={styles.loginButton}>
                    Login to Reserve
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {isFull ? (
                <button disabled className={styles.buttonDisabled}>
                    Event Full
                </button>
            ) : (
                <button
                    onClick={handleReserve}
                    disabled={loading}
                    className={styles.button}
                >
                    {loading ? "Processing..." : "Reserve Your Seat"}
                </button>
            )}
        </div>
    );
}
