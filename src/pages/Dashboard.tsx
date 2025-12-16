import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { DateCard } from '@/components/cards/DateCard';
import { TargetCard } from '@/components/cards/TargetCard';
import { AddTopicModal } from '@/components/modals/AddTopicModal';
import { EditTopicModal } from '@/components/modals/EditTopicModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarModal } from '@/components/modals/CalendarModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useData } from '@/contexts/DataContext';

type ViewMode = 'table1' | 'table2';

export const Dashboard: React.FC = () => {
    const { tableData, completedTopics, addCard, deleteCard, deleteTopic, updateTableData, addTargetCard, deleteTargetCard } = useData();

    const [view, setView] = useState<ViewMode>('table1');
    const [showSettings, setShowSettings] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showCreateTarget, setShowCreateTarget] = useState(false);
    const [addTopicInfo, setAddTopicInfo] = useState<{ tableId: string; cardId: string } | null>(null);
    const [editTopicId, setEditTopicId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ tableId: string; cardId: string } | null>(null);

    // Create Target form state
    const [newTargetTitle, setNewTargetTitle] = useState('');
    const [newTargetStart, setNewTargetStart] = useState('');
    const [newTargetEnd, setNewTargetEnd] = useState('');

    // Get sorted dates for Daily Plan
    const sortedDailyDates = useMemo(() => {
        return Object.keys(tableData.table2).sort((a, b) => {
            const [dA, mA, yA] = a.split('/').map(Number);
            const [dB, mB, yB] = b.split('/').map(Number);
            return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
        });
    }, [tableData.table2]);

    // Get target cards sorted by end date
    const sortedTargetCards = useMemo(() => {
        return [...(tableData.targetCards || [])].sort((a, b) =>
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        );
    }, [tableData.targetCards]);

    const stats = useMemo(() => {
        const activeTopicIds = new Set<string>();

        // Collect IDs from Target Cards
        (tableData.targetCards || []).forEach(card => {
            Object.values(card.data || {}).forEach(columnTopics => {
                columnTopics.forEach(id => activeTopicIds.add(id));
            });
        });

        // Collect IDs from Daily Plan (table2)
        Object.values(tableData.table2).forEach(dateColumns => {
            Object.values(dateColumns).forEach(columnTopics => {
                columnTopics.forEach(id => activeTopicIds.add(id));
            });
        });

        let total = 0, completed = 0;
        activeTopicIds.forEach(id => {
            const topic = completedTopics[id];
            if (topic) {
                total++;
                if (topic.progress === 100) completed++;
            }
        });

        return { total, completed, pct: total > 0 ? (completed / total) * 100 : 0 };
    }, [tableData, completedTopics]);

    const existingDates = useMemo(() =>
        Object.keys(tableData.table1).concat(Object.keys(tableData.table2)),
        [tableData]
    );

    const handleCalendarSelect = (date: string) => {
        addCard('table2', date);
    };

    const handleDateChange = (oldDate: string, newDate: string) => {
        const newTableData = JSON.parse(JSON.stringify(tableData));
        newTableData[view][newDate] = newTableData[view][oldDate];
        delete newTableData[view][oldDate];
        updateTableData(newTableData);
    };

    const handleDeleteTopic = (topicId: string) => {
        deleteTopic(topicId);
        setEditTopicId(null);
    };

    const handleCreateTarget = () => {
        if (!newTargetTitle.trim() || !newTargetStart || !newTargetEnd) return;
        addTargetCard(newTargetTitle.trim(), newTargetStart, newTargetEnd);
        setNewTargetTitle('');
        setNewTargetStart('');
        setNewTargetEnd('');
        setShowCreateTarget(false);
    };

    const handleDeleteTarget = (cardId: string) => {
        deleteTargetCard(cardId);
    };

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* 3-Column Header Card */}
                <div className="glass-card p-4 rounded-2xl flex flex-col lg:flex-row gap-4 mb-6 items-stretch">

                    {/* Column 1: Title/Icons AND Toggles (Stacked) */}
                    <div className="flex flex-col justify-between shrink-0 gap-3 w-full lg:w-auto">
                        {/* Title & Icons */}
                        <div className="flex items-center justify-between gap-4 w-full">
                            <h1 className="text-2xl font-bold text-white">
                                Study<span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">Goals</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all hover:bg-white/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all hover:bg-white/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                        <path strokeWidth={2} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0-1.17-2.82H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 2.82-1.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.17 2.82H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* View Toggles */}
                        <div className="bg-bg-card/50 border border-white/5 flex rounded-lg p-1 w-full sm:w-fit justify-between sm:justify-start">
                            {(['table1', 'table2'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`flex-1 px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${view === v ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span>{v === 'table1' ? '🎯' : '📅'}</span>
                                    <span>{v === 'table1' ? 'Long Term' : 'Daily'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Progress Bar */}
                    <div className="flex-1 w-full lg:w-auto flex items-end">
                        <div className="w-full">
                            <ProgressBar percentage={stats.pct} completed={stats.completed} total={stats.total} />
                        </div>
                    </div>

                    {/* Column 3: Countdown */}
                    <div className="flex items-end">
                        <Header />
                    </div>
                </div>

                {/* Target Cards View */}
                {view === 'table1' && (
                    <>
                        {sortedTargetCards.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-xl mb-2">🎯 No Targets yet</p>
                                <p className="text-sm mb-6">Create long-term targets with start and end dates</p>
                                <button
                                    onClick={() => setShowCreateTarget(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
                                >
                                    + Create First Target
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {sortedTargetCards.map((card) => (
                                        <TargetCard
                                            key={card.id}
                                            cardMeta={card}
                                            dateData={tableData.table1[card.id] || {}}
                                            completedTopics={completedTopics}
                                            onAddTopic={(tId, cId) => setAddTopicInfo({ tableId: tId, cardId: cId })}
                                            onEditTopic={(id) => setEditTopicId(id)}
                                            onDeleteCard={handleDeleteTarget}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowCreateTarget(true)}
                                    className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 font-semibold hover:text-accent-purple hover:border-accent-purple hover:bg-accent-purple/5 transition-all mt-4"
                                >
                                    + Create New Target
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Daily Plan Cards View */}
                {view === 'table2' && (
                    <>
                        {sortedDailyDates.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-xl mb-2">📅 No Daily Plans yet</p>
                                <p className="text-sm mb-6">Pick a date to start planning your day</p>
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
                                >
                                    + Pick a Date
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {sortedDailyDates.map((date) => (
                                    <DateCard
                                        key={date}
                                        tableId="table2"
                                        date={date}
                                        dateData={tableData.table2[date]}
                                        completedTopics={completedTopics}
                                        onAddTopic={(tId, d) => setAddTopicInfo({ tableId: tId, cardId: d })}
                                        onEditTopic={(id) => setEditTopicId(id)}
                                        onDeleteCard={(tId, d) => setDeleteConfirm({ tableId: tId, cardId: d })}
                                        onDateChange={handleDateChange}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onSelectDate={handleCalendarSelect} existingDates={existingDates} />
            {addTopicInfo && (
                <AddTopicModal isOpen onClose={() => setAddTopicInfo(null)} tableId={addTopicInfo.tableId} date={addTopicInfo.cardId} />
            )}
            <EditTopicModal isOpen={!!editTopicId} onClose={() => setEditTopicId(null)} topicId={editTopicId} onDelete={handleDeleteTopic} />
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && deleteCard(deleteConfirm.tableId, deleteConfirm.cardId)}
                message="This will delete the card and all its topics. Continue?"
            />

            {/* Create Target Modal */}
            {showCreateTarget && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateTarget(false)}>
                    <div className="glass-card rounded-2xl p-6 max-w-md w-full animate-slideUp" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">🎯</span> Create New Target
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Target Title</label>
                                <input
                                    type="text"
                                    value={newTargetTitle}
                                    onChange={(e) => setNewTargetTitle(e.target.value)}
                                    placeholder="e.g., Complete Physics Syllabus"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={newTargetStart}
                                        onChange={(e) => setNewTargetStart(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-green focus:ring-1 focus:ring-accent-green transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={newTargetEnd}
                                        onChange={(e) => setNewTargetEnd(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateTarget(false)}
                                className="flex-1 py-3 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTarget}
                                disabled={!newTargetTitle.trim() || !newTargetStart || !newTargetEnd}
                                className="flex-1 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                            >
                                Create Target
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

