"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { AuthState, User } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType extends AuthState {
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Assuming your JWT payload has sub (id), email, role. Adjust based on your NestJS JWT strategy.
                // Our NestJS payload: { email: user.email, sub: user.id, role: user.role }
                const user: User = {
                    id: decoded.sub,
                    email: decoded.email,
                    role: decoded.role
                };

                setState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem("token");
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        const decoded: any = jwtDecode(token);
        const user: User = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role
        };

        setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
        });

        if (user.role === 'ADMIN') {
            router.push('/admin/events');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
