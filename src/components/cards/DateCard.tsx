import React, { useMemo } from 'react';
import { ColumnSection } from './ColumnSection';
import { Topic, ColumnData } from '@/types';
import { COLUMN_HEADERS } from '@/constants';

interface DateCardProps {
    tableId: 'table1' | 'table2';
    date: string;
    dateData: ColumnData;
    completedTopics: Record<string, Topic>;
    onAddTopic: (tableId: string, date: string) => void;
    onEditTopic: (topicId: string) => void;
    onDeleteCard: (tableId: string, date: string) => void;
    onDateChange: (oldDate: string, newDate: string) => void;
}

export const DateCard: React.FC<DateCardProps> = ({
    tableId, date, dateData, completedTopics,
    onAddTopic, onEditTopic, onDeleteCard, onDateChange
}) => {
    const columns = COLUMN_HEADERS[tableId];

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

    return (
        <div className="bg-gradient-to-b from-bg-card to-bg-secondary border border-border rounded-xl mb-4 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-bg-hover border-b border-border">
                <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-sm font-bold text-white bg-accent-blue/30 border border-accent-blue px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    onBlur={(e) => {
                        const newDate = e.currentTarget.textContent?.trim();
                        if (newDate && newDate !== date) onDateChange(date, newDate);
                    }}
                >
                    {date}
                </div>

                {/* Progress */}
                <div className="flex-1 flex items-center gap-2 max-w-[200px]">
                    <span className="text-xs font-semibold text-white">{Math.round(percentage)}%</span>
                    <div className="flex-1 h-1.5 bg-bg-primary rounded-full overflow-hidden">
                        <div className="h-full bg-accent-blue rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-[0.65rem] text-gray-400 bg-bg-primary px-1.5 rounded whitespace-nowrap">
                        {completedCount}/{totalTopics}
                    </span>
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => onDeleteCard(tableId, date)}
                    className="p-1 text-gray-500 hover:text-accent-red hover:bg-accent-red/10 rounded-full transition-all"
                    title="Delete card"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Columns */}
            {columns.map((col) => (
                <ColumnSection
                    key={col}
                    columnName={col}
                    topicIds={dateData[col] || []}
                    completedTopics={completedTopics}
                    tableId={tableId}
                    onEditTopic={onEditTopic}
                />
            ))}

            {/* Add Topic Button */}
            <div className="p-4">
                <button
                    onClick={() => onAddTopic(tableId, date)}
                    className="w-full py-2 border-2 border-dashed border-border rounded-lg text-gray-400 font-semibold hover:text-accent-blue hover:border-accent-blue hover:bg-accent-blue/5 transition-all"
                >
                    + Add New Topic
                </button>
            </div>
        </div>
    );
};
