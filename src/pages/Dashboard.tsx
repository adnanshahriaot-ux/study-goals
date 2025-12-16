import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { DateCard } from '@/components/cards/DateCard';
import { AddTopicModal } from '@/components/modals/AddTopicModal';
import { EditTopicModal } from '@/components/modals/EditTopicModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CalendarModal } from '@/components/modals/CalendarModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useData } from '@/contexts/DataContext';

type ViewMode = 'table1' | 'table2';

export const Dashboard: React.FC = () => {
    const { tableData, completedTopics, addCard, deleteCard, deleteTopic, updateTableData } = useData();

    const [view, setView] = useState<ViewMode>('table1');
    const [showSettings, setShowSettings] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [addTopicInfo, setAddTopicInfo] = useState<{ tableId: string; date: string } | null>(null);
    const [editTopicId, setEditTopicId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ tableId: string; date: string } | null>(null);

    const currentData = tableData[view];
    const sortedDates = Object.keys(currentData).sort((a, b) => {
        const [dA, mA, yA] = a.split('/').map(Number);
        const [dB, mB, yB] = b.split('/').map(Number);
        return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
    });

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
        addCard(view, date);
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

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Header onSettingsClick={() => setShowSettings(true)} onCalendarClick={() => setShowCalendar(true)} />

                <ProgressBar percentage={stats.pct} completed={stats.completed} total={stats.total} />

                {/* View Toggle */}
                <div className="flex justify-center my-6">
                    <div className="flex rounded-xl bg-bg-card border border-border p-1">
                        {(['table1', 'table2'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${view === v ? 'bg-accent-blue text-white shadow-glow-blue' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {v === 'table1' ? '📚 Targets' : '🗓️ Daily Plan'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards */}
                {sortedDates.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-xl mb-4">No cards yet</p>
                        <button
                            onClick={() => setShowCalendar(true)}
                            className="px-6 py-3 bg-accent-blue text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-glow-blue"
                        >
                            + Add First Card
                        </button>
                    </div>
                ) : (
                    sortedDates.map((date) => (
                        <DateCard
                            key={date}
                            tableId={view}
                            date={date}
                            dateData={currentData[date]}
                            completedTopics={completedTopics}
                            onAddTopic={(tId, d) => setAddTopicInfo({ tableId: tId, date: d })}
                            onEditTopic={(id) => setEditTopicId(id)}
                            onDeleteCard={(tId, d) => setDeleteConfirm({ tableId: tId, date: d })}
                            onDateChange={handleDateChange}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onSelectDate={handleCalendarSelect} existingDates={existingDates} />
            {addTopicInfo && (
                <AddTopicModal isOpen onClose={() => setAddTopicInfo(null)} tableId={addTopicInfo.tableId} date={addTopicInfo.date} />
            )}
            <EditTopicModal isOpen={!!editTopicId} onClose={() => setEditTopicId(null)} topicId={editTopicId} onDelete={handleDeleteTopic} />
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && deleteCard(deleteConfirm.tableId, deleteConfirm.date)}
                message="This will delete the card and all its topics. Continue?"
            />
        </div>
    );
};
