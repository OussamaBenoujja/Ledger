"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Reservation, ReservationStatus } from "@/types";
import { useEffect, useState } from "react";
import styles from "../../admin.module.css";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function AdminEventReservationsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || user?.role !== 'ADMIN') {
                router.push("/login");
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const fetchReservations = async () => {
        try {
            const res = await api.get(`/reservations?eventId=${eventId}`);
            setReservations(res.data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN' && eventId) {
            fetchReservations();
        }
    }, [isAuthenticated, user, eventId]);

    const handleStatusUpdate = async (id: string, status: ReservationStatus) => {
        if (!confirm(`Change status to ${status}?`)) return;
        try {
            await api.patch(`/reservations/${id}/status`, { status });
            fetchReservations();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
        return <div className={styles.loading}>Loading Admin Panel...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Manage Reservations</h1>
                <Link href="/admin/events" className={styles.backLink}>
                    ← Back to Events
                </Link>
            </header>

            {loading ? (
                <p>Loading reservations...</p>
            ) : reservations.length === 0 ? (
                <p>No reservations found for this event.</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((res) => (
                                <tr key={res.id}>
                                    <td>{res.userId}</td>
                                    <td>{new Date(res.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[res.status.toLowerCase()]}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.rowActions}>
                                            {res.status === ReservationStatus.PENDING && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(res.id, ReservationStatus.CONFIRMED)}
                                                        className={styles.actionBtn}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(res.id, ReservationStatus.REFUSED)}
                                                        className={`${styles.actionBtn} ${styles.danger}`}
                                                    >
                                                        Refuse
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
