"use client";

import EventForm from "@/components/EventForm";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        // Backend expects date string, typically ISO
        const payload = {
            ...data,
            startsAt: new Date(data.startsAt).toISOString()
        };

        await api.post("/events", payload);
        router.push("/admin/events");
    };

    return (
        <EventForm
            title="Create New Event"
            onSubmit={handleSubmit}
        />
    );
}
