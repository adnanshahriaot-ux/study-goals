import React from 'react';
import { CountdownCard } from './CountdownCard';
import { useData } from '@/contexts/DataContext';

interface HeaderProps {
    onSettingsClick: () => void;
    onCalendarClick: () => void;
}

// Now Header only renders the Countdown since logo/icons are in Dashboard
export const Header: React.FC<HeaderProps> = () => {
    const { settings } = useData();

    return <CountdownCard settings={settings.countdownSettings} />;
};
