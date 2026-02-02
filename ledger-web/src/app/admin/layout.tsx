import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Panel - Ledger",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Sidebar />
            <main className="withSidebar">
                {children}
            </main>
        </div>
    );
}
