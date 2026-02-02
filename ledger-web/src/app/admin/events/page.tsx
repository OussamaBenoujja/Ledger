"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Event, EventStatus } from "@/types";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminEventsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || user?.role !== 'ADMIN') {
                router.push("/login");
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const fetchEvents = async () => {
        try {
            const res = await api.get("/events");
            setEvents(res.data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchEvents();
        }
    }, [isAuthenticated, user]);

    const handlePublish = async (id: string) => {
        if (!confirm("Publish this event?")) return;
        try {
            await api.patch(`/events/${id}/publish`);
            fetchEvents();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to publish event");
        }
    };

    const handleStatusUpdate = async (id: string, status: EventStatus) => {
        if (!confirm(`Change status to ${status}?`)) return;
        try {
            if (status === EventStatus.CANCELED) {
                await api.patch(`/events/${id}/cancel`);
            } else {
                await api.patch(`/events/${id}`, { status });
            }
            fetchEvents();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update status");
        }
    }

    if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
        return <div className={styles.loading}>Loading Admin Panel...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Event Management</h1>
                <Link href="/admin/events/new" className={styles.createButton}>
                    + Create Event
                </Link>
            </header>

            {loading ? (
                <p>Loading events...</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td>
                                        <div className={styles.eventInfo}>
                                            <span className={styles.eventTitle}>{event.title}</span>
                                            <span className={styles.eventLocation}>{event.location}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(event.startsAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[event.status.toLowerCase()]}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td>{event.filled_participants} / {event.capacity}</td>
                                    <td>
                                        <div className={styles.rowActions}>
                                            {event.status === EventStatus.DRAFT && (
                                                <>
                                                    <button onClick={() => handlePublish(event.id)} className={styles.actionBtn}>
                                                        Publish
                                                    </button>
                                                    <Link href={`/admin/events/${event.id}/edit`} className={styles.actionLink}>
                                                        Edit
                                                    </Link>
                                                </>
                                            )}
                                            {event.status === EventStatus.PUBLISHED && (
                                                <button
                                                    onClick={() => handleStatusUpdate(event.id, EventStatus.CANCELED)}
                                                    className={`${styles.actionBtn} ${styles.danger}`}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <Link href={`/events/${event.id}`} className={styles.viewLink}>
                                                View
                                            </Link>
                                            <Link href={`/admin/events/${event.id}/reservations`} className={styles.actionLink}>
                                                Reservations
                                            </Link>
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
