import React from 'react';
import { CountdownCard } from './CountdownCard';
import { useData } from '@/contexts/DataContext';

interface HeaderProps {
    onSettingsClick: () => void;
    onCalendarClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick, onCalendarClick }) => {
    const { settings } = useData();

    return (
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
            <div className="flex items-center justify-center md:justify-start gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Study
                    <span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
                        Goals
                    </span>
                </h1>

                <button
                    onClick={onCalendarClick}
                    className="p-2 bg-bg-hover border border-border rounded-lg text-gray-400 hover:text-white hover:border-border-light transition-all"
                    title="Calendar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                    </svg>
                </button>

                <button
                    onClick={onSettingsClick}
                    className="p-2 bg-bg-hover border border-border rounded-lg text-gray-400 hover:text-white hover:border-border-light transition-all"
                    title="Settings"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" strokeWidth={2} />
                        <path strokeWidth={2} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
            </div>

            <div className="flex justify-center md:justify-end">
                <CountdownCard settings={settings.countdownSettings} />
            </div>
        </div>
    );
};
