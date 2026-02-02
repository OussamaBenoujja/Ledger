import { Event } from "@/types";
import styles from "./details.module.css";
import Link from "next/link";
import BookingActions from "@/components/BookingActions";
import { notFound } from "next/navigation";

async function getEvent(id: string): Promise<Event> {
    const res = await fetch(`http://localhost:3000/events/public/${id}`, {
        cache: 'no-store'
    });

    if (res.status === 404) return notFound();

    if (!res.ok) {
        throw new Error('Failed to fetch event');
    }

    return res.json();
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                <Link href="/events">← Back to Catalog</Link>
            </div>

            <div className={styles.layout}>
                <main className={styles.main}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>{event.title}</h1>
                        <span className={`${styles.badge} ${styles[event.status.toLowerCase()]}`}>
                            {event.status}
                        </span>
                    </header>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Date</span>
                            <span className={styles.value}>{new Date(event.startsAt).toLocaleString()}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Location</span>
                            <span className={styles.value}>{event.location}</span>
                        </div>
                    </div>

                    <div className={styles.description}>
                        <h2>About this Event</h2>
                        <p>{event.description}</p>
                    </div>
                </main>

                <aside className={styles.sidebar}>
                    <div className={styles.card}>
                        <h3>Registration</h3>
                        <div className={styles.capacityBar}>
                            <div className={styles.capacityLabel}>
                                <span>Spots Filled</span>
                                <span>{event.filled_participants} / {event.capacity}</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${Math.min((event.filled_participants / event.capacity) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <BookingActions event={event} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
