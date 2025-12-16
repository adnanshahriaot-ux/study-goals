import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { StudyType } from '@/types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { settings, updateSettings } = useData();
    const [activeTab, setActiveTab] = useState<'account' | 'custom' | 'countdown'>('account');
    const [studyTypes, setStudyTypes] = useState<StudyType[]>(settings.customStudyTypes);
    const [countdownTitle, setCountdownTitle] = useState(settings.countdownSettings.title);
    const [countdownDate, setCountdownDate] = useState(settings.countdownSettings.targetDate);
    const [countdownTime, setCountdownTime] = useState(settings.countdownSettings.targetTime);

    const handleSaveStudyTypes = () => {
        updateSettings({ ...settings, customStudyTypes: studyTypes.filter((t) => t.name.trim()) });
    };

    const handleSaveCountdown = () => {
        updateSettings({
            ...settings,
            countdownSettings: { title: countdownTitle, targetDate: countdownDate, targetTime: countdownTime }
        });
    };

    const addStudyType = () => {
        setStudyTypes([...studyTypes, { key: `custom_${Date.now()}`, name: '' }]);
    };

    const removeStudyType = (key: string) => {
        setStudyTypes(studyTypes.filter((t) => t.key !== key));
    };

    const tabs = [
        { id: 'account', label: 'Account' },
        { id: 'custom', label: 'Customizations' },
        { id: 'countdown', label: 'Countdown' }
    ] as const;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="-mx-6 -mt-4 border-b border-border bg-bg-hover px-6 pt-4 rounded-t-xl">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-semibold rounded-t-lg transition-all ${activeTab === tab.id
                                    ? 'text-accent-blue bg-accent-blue/10 border-b-2 border-accent-blue -mb-px'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                {activeTab === 'account' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-bg-hover rounded-lg border border-border">
                            <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="font-semibold text-white">{user?.displayName}</div>
                                <div className="text-sm text-gray-400">{user?.email}</div>
                            </div>
                        </div>
                        <Button variant="danger" onClick={logout} className="w-full">Sign Out</Button>
                    </div>
                )}

                {activeTab === 'custom' && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Study Types</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {studyTypes.map((type) => (
                                    <div key={type.key} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={type.name}
                                            onChange={(e) => setStudyTypes(studyTypes.map((t) => t.key === type.key ? { ...t, name: e.target.value } : t))}
                                            className="flex-1 px-3 py-2 bg-bg-hover border border-border rounded-lg text-white"
                                            placeholder="Study type name"
                                        />
                                        <button onClick={() => removeStudyType(type.key)} className="p-2 text-gray-400 hover:text-accent-red">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="secondary" onClick={addStudyType} className="w-full mt-2">+ Add Study Type</Button>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button variant="success" onClick={handleSaveStudyTypes}>Save</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'countdown' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                            <input value={countdownTitle} onChange={(e) => setCountdownTitle(e.target.value)} className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Target Date</label>
                            <input type="date" value={countdownDate} onChange={(e) => setCountdownDate(e.target.value)} className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Time (Optional)</label>
                            <input type="time" value={countdownTime} onChange={(e) => setCountdownTime(e.target.value)} className="w-full px-3 py-2 bg-bg-hover border border-border rounded-lg text-white" />
                        </div>
                        <Button variant="success" onClick={handleSaveCountdown} className="w-full">Save Countdown</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
