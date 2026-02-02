"use client";

import EventForm from "@/components/EventForm";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function EditEventPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                setInitialData({
                    title: res.data.title,
                    description: res.data.description,
                    startsAt: res.data.startsAt,
                    location: res.data.location,
                    capacity: res.data.capacity
                });
            } catch (error) {
                alert("Failed to fetch event");
                router.push("/admin/events");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, router]);

    const handleSubmit = async (data: any) => {
        const payload = {
            ...data,
            startsAt: new Date(data.startsAt).toISOString()
        };

        await api.patch(`/events/${id}`, payload);
        router.push("/admin/events");
    };

    if (loading) return <div>Loading...</div>;

    return (
        <EventForm
            title="Edit Event"
            onSubmit={handleSubmit}
            initialData={initialData}
        />
    );
}
