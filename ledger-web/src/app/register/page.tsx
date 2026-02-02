"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import styles from "../login/login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await api.post("/auth/register", { email, password });
            router.push("/login?registered=true");
        } catch (err: any) {
            if (Array.isArray(err.response?.data?.message)) {
                setError(err.response.data.message.join(', '));
            } else {
                setError(err.response?.data?.message || "Registration failed");
            }
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1 className={styles.title}>Register</h1>
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.group}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.group}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <button type="submit" className={styles.button}>
                    Register
                </button>

                <p className={styles.link}>
                    Already have an account? <Link href="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}
