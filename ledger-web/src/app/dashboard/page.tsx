"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Reservation, ReservationStatus } from "@/types";
import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loadingReservations, setLoadingReservations] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const fetchReservations = async () => {
        try {
            const res = await api.get("/reservations/me");
            setReservations(res.data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setLoadingReservations(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchReservations();
        }
    }, [isAuthenticated]);

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this reservation?")) return;

        try {
            await api.delete(`/reservations/${id}`);
            fetchReservations();
        } catch (error) {
            alert("Failed to cancel reservation");
        }
    };

    const downloadTicket = async (id: string) => {
        try {
            const response = await api.get(`/reservations/${id}/ticket`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ticket-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Failed to download ticket");
        }
    };

    if (isLoading || !isAuthenticated) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Dashboard</h1>
                <div className={styles.userInfo}>
                    <span>{user?.email}</span>
                    <span className={styles.role}>{user?.role}</span>
                </div>
            </header>

            <section className={styles.section}>
                <h2 className={styles.subtitle}>My Reservations</h2>

                {loadingReservations ? (
                    <p>Loading reservations...</p>
                ) : reservations.length === 0 ? (
                    <div className={styles.empty}>
                        <p>You haven't booked any events yet.</p>
                        <Link href="/events" className={styles.button}>Browse Events</Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {reservations.map((res) => (
                            res.event ? (
                                <div key={res.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.eventTitle}>{res.event.title}</h3>
                                        <span className={`${styles.badge} ${styles[res.status.toLowerCase()]}`}>
                                            {res.status}
                                        </span>
                                    </div>

                                    <div className={styles.details}>
                                        <p>📅 {new Date(res.event.startsAt).toLocaleDateString()}</p>
                                        <p>📍 {res.event.location}</p>
                                        <p className={styles.bookedDate}>
                                            Booked on: {new Date(res.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className={styles.actions}>
                                        {res.status === ReservationStatus.CONFIRMED && (
                                            <button
                                                onClick={() => downloadTicket(res.id)}
                                                className={styles.ticketButton}
                                            >
                                                Download Ticket
                                            </button>
                                        )}

                                        {(res.status === ReservationStatus.PENDING || res.status === ReservationStatus.CONFIRMED) && (
                                            <button
                                                onClick={() => handleCancel(res.id)}
                                                className={styles.cancelButton}
                                            >
                                                Cancel
                                            </button>
                                        )}

                                        <Link href={`/events/${res.event.id}`} className={styles.linkButton}>
                                            View Event
                                        </Link>
                                    </div>
                                </div>
                            ) : null
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
