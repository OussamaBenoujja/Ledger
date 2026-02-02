import { Event } from "@/types";
import styles from "./events.module.css";
import Link from "next/link";
import HeaderActions from "@/components/HeaderActions";

async function getEvents(): Promise<Event[]> {
    const res = await fetch('http://localhost:3000/events/public', {
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Failed to fetch events');
    }

    return res.json();
}

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Upcoming Events</h1>
                <HeaderActions />
            </header>

            <div className={styles.grid}>
                {events.length === 0 ? (
                    <p className={styles.empty}>No events found.</p>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>{event.title}</h2>
                                <span className={`${styles.badge} ${styles[event.status.toLowerCase()]}`}>
                                    {event.status}
                                </span>
                            </div>

                            <p className={styles.description}>{event.description}</p>

                            <div className={styles.details}>
                                <div className={styles.infoRow}>
                                    <span>📍 {event.location}</span>
                                    <span>📅 {new Date(event.startsAt).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.capacity}>
                                    Use: {event.filled_participants} / {event.capacity}
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <Link href={`/events/${event.id}`} className={styles.button}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
