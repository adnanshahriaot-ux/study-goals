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

    const formatDateShort = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-bg-card border border-border rounded-xl mb-4 overflow-hidden">
            {/* Compact Header */}
            <div className="px-4 py-3 flex items-center gap-3">
                {/* Title */}
                <h3 className="text-base font-bold text-white flex-1 truncate flex items-center gap-2">
                    <span className="text-accent-purple">🎯</span>
                    {cardMeta.title}
                </h3>

                {/* Date Range Pill */}
                <span className="text-xs text-gray-500 hidden sm:inline">
                    {formatDateShort(cardMeta.startDate)} → {formatDateShort(cardMeta.endDate)}
                </span>

                {/* Days Badge */}
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${daysInfo.daysRemaining <= 3
                        ? 'bg-red-500/20 text-red-400'
                        : daysInfo.daysRemaining <= 7
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-accent-blue/20 text-accent-blue'
                    }`}>
                    {daysInfo.daysRemaining}d
                </span>

                {/* Progress Badge */}
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${percentage === 100
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-gray-300'
                    }`}>
                    {completedCount}/{totalTopics}
                </span>

                {/* Delete */}
                <button
                    onClick={() => onDeleteCard(cardMeta.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Slim Combined Progress Bar */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${percentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-accent-blue to-accent-purple'
                                }`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
                </div>
            </div>

            {/* Columns - Collapsible */}
            {totalTopics > 0 && (
                <div className="px-3 pb-2 space-y-1">
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
            )}

            {/* Add Topic Button */}
            <div className="px-3 pb-3">
                <button
                    onClick={() => onAddTopic('table1', cardMeta.id)}
                    className="w-full py-2 text-sm border border-dashed border-white/20 rounded-lg text-gray-400 font-medium hover:text-accent-green hover:border-accent-green hover:bg-accent-green/5 transition-all"
                >
                    + Add Topic
                </button>
            </div>
        </div>
    );
};
