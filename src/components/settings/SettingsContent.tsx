import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { StudyType } from '@/types';

interface SettingsContentProps {
    onLogout?: () => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({ onLogout }) => {
    const { user, logout } = useAuth();
    const { settings, updateSettings } = useData();
    const [activeTab, setActiveTab] = useState<'account' | 'custom' | 'countdown' | 'dev'>('account');

    // Local state for forms
    const [studyTypes, setStudyTypes] = useState<StudyType[]>([]);
    const [countdownTitle, setCountdownTitle] = useState('');
    const [countdownDate, setCountdownDate] = useState('');
    const [countdownTime, setCountdownTime] = useState('');

    useEffect(() => {
        setStudyTypes(settings.customStudyTypes || []);
        setCountdownTitle(settings.countdownSettings.title);
        setCountdownDate(settings.countdownSettings.targetDate);
        setCountdownTime(settings.countdownSettings.targetTime);
    }, [settings]);

    const handleSaveStudyTypes = () => {
        const validTypes = studyTypes.filter((t) => t.name.trim());
        updateSettings({ ...settings, customStudyTypes: validTypes });
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

    const handleLogout = () => {
        if (onLogout) onLogout();
        logout();
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: '👤' },
        { id: 'custom', label: 'Custom', icon: '🎨' },
        { id: 'countdown', label: 'Ref', icon: '⏳' },
        { id: 'dev', label: 'Dev', icon: '👨‍💻' }
    ] as const;

    return (
        <div className="flex flex-col md:flex-row h-full overflow-hidden rounded-xl bg-bg-card border border-white/10">
            {/* Sidebar */}
            <div className="w-full md:w-48 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-2 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible shrink-0 no-scrollbar">
                <h3 className="hidden md:block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Settings</h3>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-accent-blue/10 text-accent-blue'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className="text-sm">{tab.icon}</span>
                        <span className="hidden md:inline">{tab.label === 'Ref' ? 'Countdown' : tab.label}</span>
                        <span className="md:hidden text-[10px]">{tab.label}</span>
                    </button>
                ))}

                <div className="hidden md:block mt-auto pt-2 border-t border-white/5">
                    <div className="px-2 text-[9px] text-gray-600">V1.0</div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 md:p-4 bg-gradient-to-br from-bg-card to-bg-card/50 overflow-y-auto custom-scrollbar">
                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="space-y-3 animate-fadeIn">
                        <h2 className="text-sm font-bold text-white">Account</h2>

                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="w-10 h-10 bg-gradient-to-tr from-accent-purple to-accent-blue rounded-full flex items-center justify-center text-white text-base font-bold">
                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{user?.displayName}</div>
                                <div className="text-[10px] text-gray-400">{user?.email}</div>
                                <div className="text-[9px] text-green-400 mt-0.5 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-green-400" /> Active
                                </div>
                            </div>
                        </div>

                        <Button variant="danger" onClick={handleLogout} className="w-full py-2 rounded-lg text-xs font-semibold">
                            Sign Out
                        </Button>
                    </div>
                )}

                {/* Customizations Tab */}
                {activeTab === 'custom' && (
                    <div className="space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white">Study Types</h2>
                            <Button variant="success" onClick={handleSaveStudyTypes} className="px-3 py-1 text-xs">Save</Button>
                        </div>
                        <p className="text-gray-400 text-[10px]">Define custom categories</p>

                        <div className="space-y-2">
                            {studyTypes.map((type) => (
                                <div key={type.key} className="flex gap-1.5 group">
                                    <input
                                        type="text"
                                        value={type.name}
                                        onChange={(e) => setStudyTypes(studyTypes.map((t) => t.key === type.key ? { ...t, name: e.target.value } : t))}
                                        className="flex-1 px-2 py-1.5 bg-black/20 border border-white/10 rounded-md text-xs text-white focus:border-accent-blue transition-all"
                                        placeholder="Type name"
                                    />
                                    <button
                                        onClick={() => removeStudyType(type.key)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {studyTypes.length === 0 && (
                                <div className="text-center py-4 text-[10px] text-gray-500 bg-white/5 rounded-md border border-dashed border-white/10">
                                    No types yet
                                </div>
                            )}
                        </div>

                        <Button variant="secondary" onClick={addStudyType} className="w-full py-1.5 text-xs border-dashed border border-white/10">
                            + Add Type
                        </Button>
                    </div>
                )}

                {/* Countdown Tab */}
                {activeTab === 'countdown' && (
                    <div className="space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white">Countdown</h2>
                            <Button variant="success" onClick={handleSaveCountdown} className="px-3 py-1 text-xs">Save</Button>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">Title</label>
                                <input value={countdownTitle} onChange={(e) => setCountdownTitle(e.target.value)} className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-md text-xs text-white transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1">Date</label>
                                    <input type="date" value={countdownDate} onChange={(e) => setCountdownDate(e.target.value)} className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-md text-xs text-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-400 mb-1">Time</label>
                                    <input type="time" value={countdownTime} onChange={(e) => setCountdownTime(e.target.value)} className="w-full px-2 py-1.5 bg-black/20 border border-white/10 rounded-md text-xs text-white transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Developer Info Tab */}
                {activeTab === 'dev' && (
                    <div className="space-y-5 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white">Developer</h2>

                        <div className="p-6 bg-gradient-to-br from-accent-purple/20 to-accent-blue/10 border border-accent-purple/20 rounded-2xl flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center text-3xl border-2 border-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                👨‍💻
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Adnan Shahria</h3>
                                <p className="text-sm text-accent-cyan">Full Stack Developer</p>
                            </div>

                            <div className="flex items-center justify-center gap-4 w-full pt-2">
                                {/* Telegram */}
                                <a
                                    href="https://t.me/adnanshahria"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#229ED9]/20 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-all border border-[#229ED9]/30"
                                    title="Telegram"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                </a>

                                {/* Email */}
                                <a
                                    href="mailto:adnanshahria2019@gmail.com"
                                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
                                    title="Email"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </a>
                            </div>

                            <div className="pt-4 text-[10px] text-gray-500 font-mono">
                                v1.0.1 • StudyGoals Inc
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
