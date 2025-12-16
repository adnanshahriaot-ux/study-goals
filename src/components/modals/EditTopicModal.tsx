import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Dropdown } from '@/components/common/Dropdown';
import { useData } from '@/contexts/DataContext';
import { COLUMN_HEADERS } from '@/constants';

interface EditTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    topicId: string | null;
    onDelete: (topicId: string) => void;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({ isOpen, onClose, topicId, onDelete }) => {
    const { completedTopics, settings, updateTopic, tableData, updateTableData } = useData();

    // State for location tracking (to allow moving topics)
    const [locationInfo, setLocationInfo] = useState<{ tableId: 'table1' | 'table2'; cardId: string; column: string } | null>(null);
    const [newColumn, setNewColumn] = useState('');

    const [name, setName] = useState('');
    const [timedNote, setTimedNote] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [note, setNote] = useState('');
    const [hardness, setHardness] = useState('medium');
    const [studyStatus, setStudyStatus] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('low');

    useEffect(() => {
        if (topicId && completedTopics[topicId]) {
            const topic = completedTopics[topicId];
            setName(topic.name);
            setTimedNote(topic.timedNote || '');
            setEstimatedTime(topic.estimatedTime || '');
            setNote(topic.note || '');
            setHardness(topic.hardness);
            setStudyStatus(topic.studyStatus);
            setPriority(topic.priority);

            // Find topic location
            let foundLoc: { tableId: 'table1' | 'table2'; cardId: string; column: string } | null = null;
            const tables = ['table1', 'table2'] as const;

            for (const tId of tables) {
                const table = tableData[tId];
                for (const [cId, cardData] of Object.entries(table)) {
                    for (const [col, topics] of Object.entries(cardData)) {
                        if (topics.includes(topicId)) {
                            foundLoc = { tableId: tId, cardId: cId, column: col };
                            break;
                        }
                    }
                    if (foundLoc) break;
                }
                if (foundLoc) break;
            }

            if (foundLoc) {
                setLocationInfo(foundLoc);
                setNewColumn(foundLoc.column);
            }
        }
    }, [topicId, completedTopics, tableData]);

    const handleSave = () => {
        if (!topicId || !name.trim()) return;

        // Move topic if column changed
        if (locationInfo && newColumn !== locationInfo.column) {
            const updatedTableData = JSON.parse(JSON.stringify(tableData));
            const { tableId, cardId, column: oldCol } = locationInfo;

            // Remove from old
            if (updatedTableData[tableId][cardId] && updatedTableData[tableId][cardId][oldCol]) {
                updatedTableData[tableId][cardId][oldCol] = updatedTableData[tableId][cardId][oldCol].filter((id: string) => id !== topicId);
            }
            // Add to new
            if (!updatedTableData[tableId][cardId]) updatedTableData[tableId][cardId] = {};
            if (!updatedTableData[tableId][cardId][newColumn]) updatedTableData[tableId][cardId][newColumn] = [];
            updatedTableData[tableId][cardId][newColumn].push(topicId);

            updateTableData(updatedTableData);
        }

        updateTopic(topicId, {
            name: name.trim(),
            timedNote: timedNote.trim(),
            estimatedTime: estimatedTime.trim(),
            note: note.trim(),
            hardness: hardness as 'easy' | 'medium' | 'hard',
            studyStatus,
            priority
        });

        onClose();
    };

    const hardnessOptions = [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
    ];
    const studyOptions = settings.customStudyTypes.map((t) => ({ value: t.key, label: t.name }));

    // Calculate subject options based on table type
    const subjectOptions = locationInfo?.tableId === 'table1'
        ? settings.customSubjects.map(s => ({ value: s.name, label: s.name }))
        : (locationInfo?.tableId === 'table2'
            ? COLUMN_HEADERS.table2.map(c => ({ value: c, label: c }))
            : []);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Topic"
            footer={
                <div className="flex justify-between">
                    <Button variant="danger" onClick={() => topicId && onDelete(topicId)} className="text-xs px-3 py-1.5 h-8">Delete</Button>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose} className="text-xs px-3 py-1.5 h-8">Cancel</Button>
                        <Button variant="success" onClick={handleSave} className="text-xs px-3 py-1.5 h-8">Save</Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-0.5">Topic Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-2 py-1.5 bg-bg-hover border border-border rounded text-sm text-white focus:outline-none focus:border-accent-blue"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-0.5">Timed Note</label>
                    <input
                        type="text"
                        value={timedNote}
                        onChange={(e) => setTimedNote(e.target.value)}
                        className="w-full px-2 py-1.5 bg-bg-hover border border-border rounded text-sm text-white focus:outline-none focus:border-accent-blue"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-0.5">Estimated Time</label>
                    <input
                        type="text"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        className="w-full px-2 py-1.5 bg-bg-hover border border-border rounded text-sm text-white focus:outline-none focus:border-accent-blue"
                        placeholder="e.g., 11 am - 9 pm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-0.5">Notes</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="w-full px-2 py-1.5 bg-bg-hover border border-border rounded text-sm text-white focus:outline-none focus:border-accent-blue resize-none"
                        placeholder="Add your notes here..."
                    />
                </div>

                {/* Subject Selection (Move Topic) */}
                {locationInfo && (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-0.5">
                            {locationInfo.tableId === 'table1' ? 'Subject' : 'Session'}
                        </label>
                        <Dropdown
                            options={subjectOptions}
                            value={newColumn}
                            onChange={setNewColumn}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-0.5">Hardness</label>
                        <Dropdown options={hardnessOptions} value={hardness} onChange={setHardness} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-0.5">Study Type</label>
                        <Dropdown options={studyOptions} value={studyStatus} onChange={setStudyStatus} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Priority</label>
                    <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded border transition-all text-xs ${priority === p
                                    ? p === 'high' ? 'border-accent-red bg-accent-red/20 text-white'
                                        : p === 'medium' ? 'border-accent-gold bg-accent-gold/20 text-white'
                                            : 'border-border-light bg-bg-hover text-white'
                                    : 'border-border text-gray-400 hover:border-border-light'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${p === 'high' ? 'bg-accent-red' : p === 'medium' ? 'bg-accent-gold' : 'bg-gray-500'
                                    }`} />
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
