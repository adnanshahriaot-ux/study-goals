import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { CountdownSettings } from '@/types';

interface CountdownCardProps {
    settings: CountdownSettings;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ settings }) => {
    const { days, hours, minutes, seconds, isExpired } = useCountdown(settings);

    const segments = [
        { label: 'Days', value: days, color: 'from-accent-red to-red-700' },
        { label: 'Hours', value: hours, color: 'from-accent-orange to-orange-700' },
        { label: 'Mins', value: minutes, color: 'from-accent-gold to-yellow-700' },
        { label: 'Secs', value: seconds, color: 'from-accent-green to-green-700' }
    ];

    return (
        <div className="bg-gradient-to-br from-blue-900/50 to-bg-primary border border-accent-blue/50 rounded-xl p-4 shadow-glow-blue">
            <h3 className="text-center text-lg font-black uppercase tracking-wide mb-3 bg-gradient-to-r from-accent-gold via-accent-red to-accent-blue bg-clip-text text-transparent">
                {settings.title || 'Countdown'}
            </h3>

            {isExpired ? (
                <div className="text-center text-accent-red font-bold text-xl py-4">
                    🎉 Time's Up! 🎉
                </div>
            ) : (
                <div className="flex justify-center gap-3">
                    {segments.map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                            <div className="text-[0.65rem] uppercase tracking-widest text-white font-bold mb-1 drop-shadow">
                                {label}
                            </div>
                            <div className={`
                font-mono text-2xl font-black text-white
                px-3 py-2 rounded-lg min-w-[60px]
                bg-gradient-to-br ${color}
                shadow-lg
              `}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
