"use client";

import { useEffect, useState } from "react";
import styles from "./form.module.css";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

interface EventFormData {
    title: string;
    description: string;
    startsAt: string; // YYYY-MM-DDTHH:mm
    location: string;
    capacity: number;
}

interface EventFormProps {
    initialData?: EventFormData;
    onSubmit: (data: EventFormData) => Promise<void>;
    title: string;
}

export default function EventForm({ initialData, onSubmit, title }: EventFormProps) {
    const [formData, setFormData] = useState<EventFormData>({
        title: "",
        description: "",
        startsAt: "",
        location: "",
        capacity: 100,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (initialData) {
            // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
            const date = new Date(initialData.startsAt);
            // This is a rough conversion, might need better handling for timezone
            const formattedDate = date.toISOString().slice(0, 16);

            setFormData({
                ...initialData,
                startsAt: formattedDate
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await onSubmit(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.group}>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.group}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className={styles.textarea}
                        rows={4}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label htmlFor="startsAt">Date & Time</label>
                        <input
                            type="datetime-local"
                            id="startsAt"
                            name="startsAt"
                            value={formData.startsAt}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="capacity">Capacity</label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                            min={1}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.group}>
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.actions}>
                    <NextLink href="/admin/events" className={styles.cancelLink}>Cancel</NextLink>
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? "Saving..." : "Save Event"}
                    </button>
                </div>
            </form>
        </div>
    );
}
