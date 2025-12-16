import React, { useState, useMemo } from 'react';
import { DateCard } from '@/components/cards/DateCard';
import { TargetCard } from '@/components/cards/TargetCard';
import { BottomNav } from '@/components/layout/BottomNav';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { AddTopicModal } from '@/components/modals/AddTopicModal';
import { EditTopicModal } from '@/components/modals/EditTopicModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarModal } from '@/components/modals/CalendarModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useCountdown } from '@/hooks/useCountdown';

type ViewMode = 'table1' | 'table2';
type MobileTab = 'dashboard' | 'targets' | 'daily' | 'settings';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { tableData, completedTopics, addCard, deleteCard, deleteTopic, updateTableData, addTargetCard, deleteTargetCard, settings } = useData();
    const { days, hours, minutes, seconds } = useCountdown(settings.countdownSettings);

    const [view, setView] = useState<ViewMode>('table1');
    const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('dashboard');
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
                    {/* MOBILE LAYOUT (md:hidden) - Tab-based Native App Experience */}
                    <div className="block md:hidden pb-24">
                        {/* DASHBOARD TAB */}
                        {activeMobileTab === 'dashboard' && (
                            <div className="space-y-3 animate-fadeIn">
                                {/* Header - Compact */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 bg-gradient-to-tr from-accent-purple to-accent-blue rounded-xl flex items-center justify-center text-xl shadow-lg shadow-accent-purple/20">
                                            🎓
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-white">
                                                Study<span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">Goals</span>
                                            </h1>
                                            <p className="text-[10px] text-gray-400">Welcome, {user?.displayName?.split(' ')[0] || 'Student'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Card - Compact */}
                                <div className="glass-card p-3 rounded-xl border border-accent-green/20 bg-gradient-to-br from-emerald-900/20 to-slate-800/50 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-2xl font-black text-white">{stats.pct.toFixed(0)}%</span>
                                                    <span className="text-[10px] text-gray-500">{stats.completed}/{stats.total}</span>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-accent-green/20 rounded-lg text-accent-green">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-700/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-accent-green via-emerald-400 to-teal-400 transition-all duration-1000 ease-out"
                                                style={{ width: `${stats.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Countdown Card - Compact */}
                                <div className="glass-card p-3 rounded-xl border border-accent-blue/20 bg-gradient-to-br from-blue-900/30 via-slate-800/50 to-purple-900/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-accent-blue uppercase tracking-wider">{settings.countdownSettings.title || 'Countdown'}</span>
                                            <p className="text-[9px] text-gray-500">{settings.countdownSettings.targetDate}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {timeLeft.map((t, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className={`w-full py-2 rounded-lg flex items-center justify-center ${i === 3 ? 'bg-accent-green/20' : 'bg-white/5'}`}>
                                                    <span className={`text-lg font-black ${i === 3 ? 'text-accent-green' : 'text-white'}`}>{t}</span>
                                                </div>
                                                <span className="text-[8px] font-bold text-gray-500 uppercase mt-1">
                                                    {['Days', 'Hrs', 'Min', 'Sec'][i]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions - Compact */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setActiveMobileTab('targets')}
                                        className="glass-card p-3 rounded-xl border border-accent-purple/20 hover:border-accent-purple/40 transition-all group text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🎯</span>
                                            <div>
                                                <span className="text-xs font-bold text-white group-hover:text-accent-purple transition-colors block">Targets</span>
                                                <span className="text-[10px] text-gray-500">{sortedTargetCards.length} active</span>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveMobileTab('daily')}
                                        className="glass-card p-3 rounded-xl border border-accent-cyan/20 hover:border-accent-cyan/40 transition-all group text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">📅</span>
                                            <div>
                                                <span className="text-xs font-bold text-white group-hover:text-accent-cyan transition-colors block">Daily</span>
                                                <span className="text-[10px] text-gray-500">{sortedDailyDates.length} days</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TARGETS TAB */}
                        {activeMobileTab === 'targets' && (
                            <div className="space-y-3 animate-fadeIn">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        🎯 Targets
                                    </h2>
                                    <button
                                        onClick={() => setShowCreateTarget(true)}
                                        className="px-3 py-1.5 bg-accent-purple hover:bg-accent-purple/80 text-white rounded-lg text-xs font-semibold transition-all"
                                    >
                                        + New
                                    </button>
                                </div>

                                {sortedTargetCards.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <span className="text-4xl mb-3 block">🎯</span>
                                        <p className="text-sm mb-1">No targets yet</p>
                                        <p className="text-xs text-gray-600 mb-4">Create long-term targets</p>
                                        <button
                                            onClick={() => setShowCreateTarget(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-lg text-sm font-semibold"
                                        >
                                            + Create Target
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
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
                                )}
                            </div>
                        )}

                        {/* DAILY TAB */}
                        {activeMobileTab === 'daily' && (
                            <div className="space-y-3 animate-fadeIn">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        📅 Daily Plans
                                    </h2>
                                    <button
                                        onClick={() => setShowCalendar(true)}
                                        className="px-3 py-1.5 bg-accent-cyan hover:bg-accent-cyan/80 text-black rounded-lg text-xs font-semibold transition-all"
                                    >
                                        + Add
                                    </button>
                                </div>

                                {sortedDailyDates.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <span className="text-4xl mb-3 block">📅</span>
                                        <p className="text-sm mb-1">No daily plans yet</p>
                                        <p className="text-xs text-gray-600 mb-4">Pick a date to start</p>
                                        <button
                                            onClick={() => setShowCalendar(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-lg text-sm font-semibold"
                                        >
                                            + Pick Date
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
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
                            </div>
                        )}

                        {/* SETTINGS TAB */}
                        {activeMobileTab === 'settings' && (
                            <div className="animate-fadeIn">
                                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    ⚙️ Settings
                                </h2>
                                <SettingsContent onLogout={logout} />
                            </div>
                        )}

                        {/* Bottom Navigation */}
                        <BottomNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />
                    </div>


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

                {/* DESKTOP ONLY: Target Cards View */}
                <div className="hidden md:block">
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
                </div>

                {/* DESKTOP ONLY: Daily Plan Cards View */}
                <div className="hidden md:block">
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
        </div>
    );
};

