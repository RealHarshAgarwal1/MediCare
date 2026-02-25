'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { userAuthStore } from '@/store/authStore';

function AuthSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setUser } = userAuthStore();

    useEffect(() => {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const userParam = searchParams.get('user');

        if (token && type && userParam) {
            try {
                const user = JSON.parse(userParam);
                user.type = type;
                setUser(user, token);

                // Redirect to appropriate dashboard
                if (type === 'doctor') {
                    router.replace('/doctor/dashboard');
                } else {
                    router.replace('/patient/dashboard');
                }
            } catch (error) {
                console.error('Failed to parse user data:', error);
                router.replace('/login/patient');
            }
        } else {
            router.replace('/login/patient');
        }
    }, [searchParams, router, setUser]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.2rem',
            color: '#666'
        }}>
            Signing you in...
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                Signing you in...
            </div>
        }>
            <AuthSuccessContent />
        </Suspense>
    );
}
