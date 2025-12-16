import React, { useMemo } from 'react';
import { ColumnSection } from './ColumnSection';
import { Topic, ColumnData, TargetCardMeta } from '@/types';
import { COLUMN_HEADERS } from '@/constants';

interface TargetCardProps {
    cardMeta: TargetCardMeta;
    dateData: ColumnData;
    completedTopics: Record<string, Topic>;
    onAddTopic: (tableId: string, cardId: string) => void;
    onEditTopic: (topicId: string) => void;
    onDeleteCard: (cardId: string) => void;
}

export const TargetCard: React.FC<TargetCardProps> = ({
    cardMeta, dateData, completedTopics,
    onAddTopic, onEditTopic, onDeleteCard
}) => {
    const columns = COLUMN_HEADERS.table1;

    // Calculate progress stats
    const { totalTopics, completedCount, percentage } = useMemo(() => {
        let total = 0, completed = 0;
        columns.forEach((col) => {
            const ids = dateData[col] || [];
            ids.forEach((id) => {
                const topic = completedTopics[id];
                if (topic) {
                    total++;
                    if (topic.progress === 100) completed++;
                }
            });
        });
        return { totalTopics: total, completedCount: completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
    }, [columns, dateData, completedTopics]);

    // Calculate days remaining
    const daysInfo = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(cardMeta.startDate);
        const end = new Date(cardMeta.endDate);

        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const daysPassed = totalDays - daysRemaining;
        const timeProgress = totalDays > 0 ? Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)) : 0;

        return { totalDays, daysRemaining: Math.max(0, daysRemaining), timeProgress };
    }, [cardMeta.startDate, cardMeta.endDate]);

    const getProgressGradient = () => {
        if (percentage === 100) return 'from-green-500 to-emerald-400';
        if (percentage >= 75) return 'from-blue-500 to-cyan-400';
        if (percentage >= 50) return 'from-yellow-500 to-amber-400';
        if (percentage >= 25) return 'from-orange-500 to-red-400';
        return 'from-gray-600 to-gray-500';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="glass-card rounded-2xl mb-5 overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between gap-3 mb-3">
                    {/* Target Title */}
                    <h3 className="text-lg font-bold text-white flex-1 truncate">
                        🎯 {cardMeta.title}
                    </h3>

                    {/* Days Remaining Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${daysInfo.daysRemaining <= 3
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : daysInfo.daysRemaining <= 7
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                        {daysInfo.daysRemaining === 0 ? 'Due Today!' : `${daysInfo.daysRemaining} days left`}
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => onDeleteCard(cardMeta.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete target"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-green-400">▶</span>
                        <span>{formatDate(cardMeta.startDate)}</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 via-white/10 to-red-500/50" />
                    <div className="flex items-center gap-2 text-gray-400">
                        <span>{formatDate(cardMeta.endDate)}</span>
                        <span className="text-red-400">■</span>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2">
                    {/* Task Progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-16">Tasks</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressGradient()} rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className={`text-xs font-bold w-16 text-right ${percentage === 100 ? 'text-green-400' : 'text-white'}`}>
                            {completedCount}/{totalTopics}
                        </span>
                    </div>

                    {/* Time Progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-16">Time</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${daysInfo.timeProgress}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">
                            {Math.round(daysInfo.timeProgress)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Columns */}
            <div className="p-4 space-y-1">
                {columns.map((col) => (
                    <ColumnSection
                        key={col}
                        columnName={col}
                        topicIds={dateData[col] || []}
                        completedTopics={completedTopics}
                        tableId="table1"
                        onEditTopic={onEditTopic}
                    />
                ))}
            </div>

            {/* Add Topic Button */}
            <div className="px-4 pb-4">
                <button
                    onClick={() => onAddTopic('table1', cardMeta.id)}
                    className="w-full py-2.5 border-2 border-dashed border-white/20 rounded-xl text-gray-400 font-semibold hover:text-accent-green hover:border-accent-green hover:bg-accent-green/5 transition-all"
                >
                    + Add Topic to Target
                </button>
            </div>
        </div>
    );
};
