"use client";
import { useEffect, useState } from 'react';
export function useEnglishClock() {
    const [now, setNow] = useState(() => new Date().toISOString());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date().toISOString()), 30000);
        return () => window.clearInterval(timer);
    }, []);
    return now;
}
