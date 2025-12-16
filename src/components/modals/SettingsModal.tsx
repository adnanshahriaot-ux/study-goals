import React, { useState, useEffect } from 'react';
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

    // Local state for forms
    const [studyTypes, setStudyTypes] = useState<StudyType[]>([]);
    const [countdownTitle, setCountdownTitle] = useState('');
    const [countdownDate, setCountdownDate] = useState('');
    const [countdownTime, setCountdownTime] = useState('');

    // Sync state when modal opens or settings change (fixes "unsaved" issue on re-open)
    useEffect(() => {
        if (isOpen) {
            setStudyTypes(settings.customStudyTypes || []);
            setCountdownTitle(settings.countdownSettings.title);
            setCountdownDate(settings.countdownSettings.targetDate);
            setCountdownTime(settings.countdownSettings.targetTime);
        }
    }, [isOpen, settings]);

    const handleSaveStudyTypes = () => {
        // Filter out empty names before saving
        const validTypes = studyTypes.filter((t) => t.name.trim());
        updateSettings({ ...settings, customStudyTypes: validTypes });
        // Optional: Show toast or feedback handled by context
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
        { id: 'account', label: 'My Account', icon: '👤' },
        { id: 'custom', label: 'Customizations', icon: '🎨' },
        { id: 'countdown', label: 'Countdown', icon: '⏳' }
    ] as const;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="flex h-[500px] overflow-hidden rounded-2xl bg-bg-card border border-white/10">
                {/* Sidebar */}
                <div className="w-1/3 bg-black/20 border-r border-white/5 p-4 flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Settings</h3>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeTab === tab.id
                                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="px-2 mb-2 text-xs text-gray-500">StudyGoals V1.0</div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 bg-gradient-to-br from-bg-card to-bg-card/50 overflow-y-auto">
                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-white">My Account</h2>

                            <div className="flex items-center gap-5 p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-16 h-16 bg-gradient-to-tr from-accent-purple to-accent-blue rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-accent-purple/20">
                                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white">{user?.displayName}</div>
                                    <div className="text-gray-400">{user?.email}</div>
                                    <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Active Session
                                    </div>
                                </div>
                            </div>

                            <Button variant="danger" onClick={logout} className="w-full py-4 rounded-xl text-base font-semibold border border-red-500/20 hover:bg-red-500/10">
                                Sign Out
                            </Button>
                        </div>
                    )}

                    {/* Customizations Tab */}
                    {activeTab === 'custom' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Study Types</h2>
                                <Button variant="success" onClick={handleSaveStudyTypes} className="px-6">Save Changes</Button>
                            </div>
                            <p className="text-gray-400 text-sm">Define your custom study categories (e.g., Theory, Practical, revision).</p>

                            <div className="space-y-3">
                                {studyTypes.map((type) => (
                                    <div key={type.key} className="flex gap-3 group">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={type.name}
                                                onChange={(e) => setStudyTypes(studyTypes.map((t) => t.key === type.key ? { ...t, name: e.target.value } : t))}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                                placeholder="Type Name (e.g. Lab Work)"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-blue/50"></div>
                                        </div>
                                        <button
                                            onClick={() => removeStudyType(type.key)}
                                            className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                            title="Remove"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {studyTypes.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        No custom types yet
                                    </div>
                                )}
                            </div>

                            <Button variant="secondary" onClick={addStudyType} className="w-full py-3 border-dashed border-2 border-white/10 hover:border-accent-blue/50 hover:text-accent-blue">
                                + Add New Study Type
                            </Button>
                        </div>
                    )}

                    {/* Countdown Tab */}
                    {activeTab === 'countdown' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Countdown</h2>
                                <Button variant="success" onClick={handleSaveCountdown} className="px-6">Update</Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                                    <input value={countdownTitle} onChange={(e) => setCountdownTitle(e.target.value)} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-accent-purple transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Date</label>
                                        <input type="date" value={countdownDate} onChange={(e) => setCountdownDate(e.target.value)} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-accent-purple transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Time (Optional)</label>
                                        <input type="time" value={countdownTime} onChange={(e) => setCountdownTime(e.target.value)} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-accent-purple transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
