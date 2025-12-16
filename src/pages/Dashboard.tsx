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
        let total = 0, completed = 0;
        Object.values(completedTopics).forEach((t) => {
            total++;
            if (t.progress === 100) completed++;
        });
        return { total, completed, pct: total > 0 ? (completed / total) * 100 : 0 };
    }, [completedTopics]);

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
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Header onSettingsClick={() => setShowSettings(true)} onCalendarClick={() => setShowCalendar(true)} />

                <ProgressBar percentage={stats.pct} completed={stats.completed} total={stats.total} />

                {/* View Toggle */}
                <div className="flex justify-center my-6">
                    <div className="glass-card flex rounded-xl p-1">
                        {(['table1', 'table2'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${view === v ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {v === 'table1' ? '🎯 Targets' : '📅 Daily Plan'}
                            </button>
                        ))}
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
                                <button
                                    onClick={() => setShowCreateTarget(true)}
                                    className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 font-semibold hover:text-accent-purple hover:border-accent-purple hover:bg-accent-purple/5 transition-all mb-4"
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
                            sortedDailyDates.map((date) => (
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
                            ))
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

