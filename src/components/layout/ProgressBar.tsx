import React from 'react';

interface ProgressBarProps {
    percentage: number;
    completed: number;
    total: number;
    label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, completed, total, label }) => {
    return (
        <div className="bg-bg-card p-4 rounded-xl border border-border shadow-lg">
            <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-white">
                    {label || 'Overall Progress'}
                </span>
                <span className="text-lg font-bold text-accent-green">{Math.round(percentage)}%</span>
            </div>

            <div className="w-full bg-bg-hover rounded-full h-3 overflow-hidden shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-accent-green to-green-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="text-right mt-2">
                <span className="bg-accent-green/20 text-accent-green text-xs font-semibold px-2 py-1 rounded-full">
                    {completed} / {total} Done
                </span>
            </div>
        </div>
    );
};
