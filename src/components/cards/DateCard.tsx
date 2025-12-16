import React, { useMemo, useState } from 'react';
import { ColumnSection } from './ColumnSection';
import { Topic, ColumnData } from '@/types';
import { COLUMN_HEADERS } from '@/constants';
import { useData } from '@/contexts/DataContext';

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
    const { tableData, updateTableData } = useData();
    const [showPullModal, setShowPullModal] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

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

    // Get all topics from Targets (table1) that can be pulled to Daily Plan
    const availableTargetTopics = useMemo(() => {
        if (tableId !== 'table2') return [];

        const topics: { topicId: string; topic: Topic; sourceDate: string; column: string }[] = [];
        const alreadyInDailyPlan = new Set<string>();

        // Get all topic IDs already in this Daily Plan card
        Object.values(dateData).forEach(ids => {
            ids.forEach(id => alreadyInDailyPlan.add(id));
        });

        // Get topics from Targets that aren't in this Daily Plan card
        Object.entries(tableData.table1).forEach(([sourceDate, cols]) => {
            Object.entries(cols).forEach(([column, topicIds]) => {
                topicIds.forEach(topicId => {
                    if (!alreadyInDailyPlan.has(topicId) && completedTopics[topicId]) {
                        topics.push({
                            topicId,
                            topic: completedTopics[topicId],
                            sourceDate,
                            column
                        });
                    }
                });
            });
        });

        return topics;
    }, [tableId, tableData, dateData, completedTopics]);

    const handlePullTopic = (topicId: string, targetColumn: string) => {
        const newTableData = JSON.parse(JSON.stringify(tableData));
        if (!newTableData.table2[date]) {
            newTableData.table2[date] = {};
        }
        if (!newTableData.table2[date][targetColumn]) {
            newTableData.table2[date][targetColumn] = [];
        }
        newTableData.table2[date][targetColumn].push(topicId);
        updateTableData(newTableData);
        setShowPullModal(false);
        setSelectedColumn(null);
    };

    const getProgressGradient = () => {
        if (percentage === 100) return 'from-green-500 to-emerald-400';
        if (percentage >= 75) return 'from-blue-500 to-cyan-400';
        if (percentage >= 50) return 'from-yellow-500 to-amber-400';
        if (percentage >= 25) return 'from-orange-500 to-red-400';
        return 'from-gray-600 to-gray-500';
    };

    return (
        <div className="glass-card rounded-2xl mb-5 overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
                {/* Date Badge */}
                <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-sm font-bold text-white bg-gradient-to-r from-accent-blue/30 to-accent-purple/30 border border-accent-blue/50 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                    onBlur={(e) => {
                        const newDate = e.currentTarget.textContent?.trim();
                        if (newDate && newDate !== date) onDateChange(date, newDate);
                    }}
                >
                    {date}
                </div>

                {/* Progress Bar */}
                <div className="flex-1 flex items-center gap-3 max-w-[250px]">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${getProgressGradient()} rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${percentage === 100 ? 'text-green-400' : 'text-white'}`}>
                            {Math.round(percentage)}%
                        </span>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {completedCount}/{totalTopics}
                        </span>
                    </div>
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => onDeleteCard(tableId, date)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete card"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Columns */}
            <div className="p-4 space-y-1">
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
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 flex gap-2">
                <button
                    onClick={() => onAddTopic(tableId, date)}
                    className="flex-1 py-2.5 border-2 border-dashed border-white/20 rounded-xl text-gray-400 font-semibold hover:text-accent-blue hover:border-accent-blue hover:bg-accent-blue/5 transition-all"
                >
                    + Add New Topic
                </button>

                {/* Pull from Targets button - only show in Daily Plan */}
                {tableId === 'table2' && availableTargetTopics.length > 0 && (
                    <button
                        onClick={() => setShowPullModal(true)}
                        className="pull-button px-4 py-2.5 rounded-xl font-semibold"
                    >
                        ⬇ Pull
                    </button>
                )}
            </div>

            {/* Pull from Targets Modal */}
            {showPullModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPullModal(false)}>
                    <div className="glass-card rounded-2xl p-6 max-w-md w-full max-h-[70vh] overflow-auto animate-slideUp" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">📚</span> Pull from Targets
                        </h3>

                        {selectedColumn === null ? (
                            <>
                                <p className="text-gray-400 text-sm mb-4">Select a session to add the topic to:</p>
                                <div className="space-y-2">
                                    {columns.map(col => (
                                        <button
                                            key={col}
                                            onClick={() => setSelectedColumn(col)}
                                            className="w-full p-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
                                        >
                                            {col}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setSelectedColumn(null)}
                                    className="text-gray-400 hover:text-white text-sm mb-3 flex items-center gap-1"
                                >
                                    ← Back to sessions
                                </button>
                                <p className="text-gray-400 text-sm mb-4">Adding to: <span className="text-white font-medium">{selectedColumn}</span></p>
                                <div className="space-y-2">
                                    {availableTargetTopics.map(({ topicId, topic, sourceDate, column }) => (
                                        <button
                                            key={topicId}
                                            onClick={() => handlePullTopic(topicId, selectedColumn)}
                                            className="w-full p-3 text-left topic-card hover:border-accent-purple/50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${topic.progress === 100 ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                <span className="text-white font-medium">{topic.name}</span>
                                                <span className="text-xs text-gray-500">{topic.progress}%</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                From: {column} • {sourceDate}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => { setShowPullModal(false); setSelectedColumn(null); }}
                            className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
