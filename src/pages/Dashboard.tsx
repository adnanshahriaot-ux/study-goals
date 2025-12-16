import React, { useState, useMemo } from 'react';
import { DateCard } from '@/components/cards/DateCard';
import { TargetCard } from '@/components/cards/TargetCard';
import { AddTopicModal } from '@/components/modals/AddTopicModal';
import { EditTopicModal } from '@/components/modals/EditTopicModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarModal } from '@/components/modals/CalendarModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useData } from '@/contexts/DataContext';
import { useCountdown } from '@/hooks/useCountdown';

type ViewMode = 'table1' | 'table2';

export const Dashboard: React.FC = () => {
    const { tableData, completedTopics, addCard, deleteCard, deleteTopic, updateTableData, addTargetCard, deleteTargetCard, settings } = useData();
    const { days, hours, minutes, seconds } = useCountdown(settings.countdownSettings);

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

    const timeLeft = [days, hours, minutes, seconds];

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
            // Check both card.data (new) and table1 (legacy/current)
            // Fix: card.data might be initialized as {} so we must check if it has keys
            const hasNewData = card.data && Object.keys(card.data).length > 0;
            const data = hasNewData ? card.data : (tableData.table1[card.id] || {});

            Object.values(data || {}).forEach(columnTopics => {
                if (Array.isArray(columnTopics)) {
                    columnTopics.forEach(id => activeTopicIds.add(id));
                }
            });
        });

        // Collect IDs from Daily Plan (table2)
        Object.values(tableData.table2).forEach(dateColumns => {
            Object.values(dateColumns).forEach(columnTopics => {
                if (Array.isArray(columnTopics)) {
                    columnTopics.forEach(id => activeTopicIds.add(id));
                }
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
                {/* HEADER REDESIGN */}
                <div className="mb-6">
                    {/* MOBILE LAYOUT (md:hidden) */}
                    <div className="block md:hidden space-y-4">
                        {/* Row 1: Brand & Actions */}
                        <div className="flex items-center justify-between p-1">
                            <h1 className="text-2xl font-bold text-white">
                                Study<span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">Goals</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                        <path strokeWidth={2} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0-1.17-2.82H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 2.82-1.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0 1.17 2.82H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Stats & Countdown Stack */}
                        <div className="grid grid-cols-1 gap-3">
                            {/* Mobile Stats - Compact */}
                            <div className="glass-card p-3 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/60 to-slate-800/60 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                                            Progress
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[10px] font-medium text-gray-500">{stats.completed}/{stats.total}</span>
                                            <span className="text-lg font-black text-white">{stats.pct.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-gray-700/30 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent-green via-emerald-500 to-accent-blue transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            style={{ width: `${stats.pct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Countdown - Compact */}
                            <div className="glass-card p-3 rounded-2xl border border-accent-blue/20 bg-gradient-to-br from-blue-900/30 via-slate-800/50 to-purple-900/30 shadow-[0_0_20px_-5px_rgba(30,58,138,0.3)]">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-accent-blue via-indigo-400 to-accent-purple bg-clip-text text-transparent">
                                        {settings.countdownSettings.title || 'Exam'}
                                    </h3>
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-accent-blue/50 to-transparent rounded-full" />
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {timeLeft.map((t, i) => (
                                        <div key={i} className="flex flex-col items-center group">
                                            <div className="relative w-full h-10 flex items-center justify-center mb-1">
                                                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${i === 3 ? 'from-emerald-500/20 to-green-600/10' : 'from-indigo-500/20 to-blue-600/10'} border border-white/10 group-hover:border-white/20 transition-all`} />
                                                <span className={`relative text-lg font-black ${i === 3 ? 'text-emerald-400' : 'text-white'}`}>
                                                    {t}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">
                                                {['Day', 'Hr', 'Min', 'Sec'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Segmented Control Toggles */}
                        <div className="bg-bg-card border border-white/5 p-1 rounded-xl flex">
                            {(['table1', 'table2'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${view === v
                                        ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'}`}
                                >
                                    <span>{v === 'table1' ? '🎯' : '🗓️'}</span>
                                    <span>{v === 'table1' ? 'Long Term' : 'Daily Plan'}</span>
                                </button>
                            ))}
                        </div>
                    </div> {/* End Mobile Layout */}


                    {/* DESKTOP LAYOUT (hidden md:flex) - PRESERVED */}
                    <div className="hidden md:flex glass-card p-4 rounded-2xl flex-col lg:flex-row gap-4 items-stretch">
                        {/* Column 1: Title & Toggles (Glassmorphic Glow) */}
                        <div className="bg-bg-card/80 border border-accent-purple/30 rounded-xl p-3 shadow-[0_0_15px_-5px_rgba(168,85,247,0.25)] flex flex-col justify-center gap-2 min-w-[240px] relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                            <div className="relative z-10 flex flex-col gap-1.5">
                                {/* Title & Icons */}
                                <div className="flex items-center justify-between gap-4 w-full">
                                    <h1 className="text-xl font-bold text-white">
                                        Study<span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">Goals</span>
                                    </h1>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setShowCalendar(true)}
                                            className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all hover:bg-white/10"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setShowSettings(true)}
                                            className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all hover:bg-white/10"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                                <path strokeWidth={2} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0-1.17-2.82H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 2.82-1.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0 1.17 2.82H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* View Toggles */}
                                <div className="bg-bg-card/50 border border-white/5 flex rounded-lg p-1 w-full">
                                    {(['table1', 'table2'] as const).map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setView(v)}
                                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${view === v ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <span>{v === 'table1' ? '🎯' : '🗓️'}</span>
                                            <span>{v === 'table1' ? 'Target' : 'Daily'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Stats (Fill Remaining) */}
                        <div className="flex-1 bg-black/20 rounded-xl p-3 border border-accent-green/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Overall Progress</span>
                                    <span className="text-2xl font-bold text-white">{stats.pct.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden mb-2 border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent-green to-accent-blue transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        style={{ width: `${stats.pct}%` }}
                                    />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent-green/20 text-accent-green border border-accent-green/20 box-shadow-green">
                                        {stats.completed} / {stats.total} DONE
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Countdown (Darker card) */}
                        <div className="bg-bg-card/80 border border-accent-blue/30 rounded-xl p-3 min-w-[200px] shadow-[0_0_20px_-5px_rgba(59,130,246,0.25)] flex flex-col justify-center relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-accent-red uppercase tracking-wider">{settings.countdownSettings.title || 'Countdown'}</span>
                                </div>
                                <div className="flex gap-1 justify-center">
                                    {timeLeft.map((t, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-lg ${i === 3 ? 'bg-accent-green' : 'bg-accent-red'} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                                                {t}
                                            </div>
                                            <span className="text-[8px] text-gray-500 font-mono mt-1">
                                                {['DAYS', 'HOURS', 'MINS', 'SECS'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
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
                            <div className="flex flex-col gap-4">
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
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 font-semibold hover:text-accent-cyan hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all"
                                >
                                    + Add New Day
                                </button>
                            </div>
                        )}
                    </>
                )}
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
        </div>
    );
};

