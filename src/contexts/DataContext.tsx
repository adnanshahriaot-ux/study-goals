import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { AppSettings, TableData, CompletedTopics, Topic } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_TABLE_DATA } from '@/constants';
import { subscribeToData, subscribeToSettings, saveData, saveSettings } from '@/services/data.service';
import { useAuth } from './AuthContext';
import { useToastContext } from './ToastContext';

interface DataContextType {
    tableData: TableData;
    completedTopics: CompletedTopics;
    settings: AppSettings;
    isLoading: boolean;
    updateTopic: (topicId: string, updates: Partial<Topic>) => void;
    addTopic: (tableId: string, date: string, column: string, topic: Topic) => string;
    deleteTopic: (topicId: string) => void;
    updateTableData: (newTableData: TableData) => void;
    updateSettings: (newSettings: AppSettings) => void;
    addCard: (tableId: 'table1' | 'table2', date: string) => void;
    deleteCard: (tableId: string, date: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToastContext();

    const [tableData, setTableData] = useState<TableData>({ ...DEFAULT_TABLE_DATA });
    const [completedTopics, setCompletedTopics] = useState<CompletedTopics>({});
    const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });
    const [isLoading, setIsLoading] = useState(true);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Subscribe to data when user changes
    useEffect(() => {
        if (!user) {
            setTableData({ ...DEFAULT_TABLE_DATA });
            setCompletedTopics({});
            setSettings({ ...DEFAULT_SETTINGS });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const unsubData = subscribeToData(
            user.email,
            (data) => {
                setTableData(data.tableData);
                setCompletedTopics(data.completedTopics);
                setIsLoading(false);
            },
            (error) => {
                console.error('Data subscription error:', error);
                showToast('error', 'Failed to load data');
                setIsLoading(false);
            }
        );

        const unsubSettings = subscribeToSettings(
            user.email,
            (s) => setSettings(s),
            (error) => console.error('Settings error:', error)
        );

        return () => {
            unsubData();
            unsubSettings();
        };
    }, [user, showToast]);

    // Debounced save
    const debouncedSave = useCallback((newTableData: TableData, newTopics: CompletedTopics) => {
        if (!user) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                showToast('syncing', 'Syncing...');
                await saveData(user.email, newTableData, newTopics);
                showToast('success', 'Synced');
            } catch (error) {
                showToast('error', 'Sync failed');
            }
        }, 1000);
    }, [user, showToast]);

    const updateTopic = useCallback((topicId: string, updates: Partial<Topic>) => {
        setCompletedTopics((prev) => {
            const updated = { ...prev, [topicId]: { ...prev[topicId], ...updates } };
            debouncedSave(tableData, updated);
            return updated;
        });
    }, [tableData, debouncedSave]);

    const addTopic = useCallback((tableId: string, date: string, column: string, topic: Topic): string => {
        const topicId = `topic_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;

        setCompletedTopics((prev) => ({ ...prev, [topicId]: topic }));
        setTableData((prev) => {
            const updated = { ...prev };
            if (!updated[tableId as keyof TableData][date]) {
                updated[tableId as keyof TableData][date] = {};
            }
            if (!updated[tableId as keyof TableData][date][column]) {
                updated[tableId as keyof TableData][date][column] = [];
            }
            updated[tableId as keyof TableData][date][column] = [
                ...updated[tableId as keyof TableData][date][column],
                topicId
            ];

            setCompletedTopics((topics) => {
                debouncedSave(updated, { ...topics, [topicId]: topic });
                return { ...topics, [topicId]: topic };
            });

            return updated;
        });

        return topicId;
    }, [debouncedSave]);

    const deleteTopic = useCallback((topicId: string) => {
        setCompletedTopics((prev) => {
            const { [topicId]: _, ...rest } = prev;
            return rest;
        });

        setTableData((prev) => {
            const updated = JSON.parse(JSON.stringify(prev)) as TableData;
            (['table1', 'table2'] as const).forEach((tableId) => {
                Object.keys(updated[tableId]).forEach((date) => {
                    Object.keys(updated[tableId][date]).forEach((col) => {
                        updated[tableId][date][col] = updated[tableId][date][col].filter((id) => id !== topicId);
                    });
                });
            });

            setCompletedTopics((topics) => {
                const { [topicId]: _, ...rest } = topics;
                debouncedSave(updated, rest);
                return rest;
            });

            return updated;
        });
    }, [debouncedSave]);

    const updateTableData = useCallback((newTableData: TableData) => {
        setTableData(newTableData);
        debouncedSave(newTableData, completedTopics);
    }, [completedTopics, debouncedSave]);

    const updateSettings = useCallback(async (newSettings: AppSettings) => {
        if (!user) return;
        setSettings(newSettings);
        try {
            await saveSettings(user.email, newSettings);
            showToast('success', 'Settings saved');
        } catch {
            showToast('error', 'Failed to save settings');
        }
    }, [user, showToast]);

    const addCard = useCallback((tableId: 'table1' | 'table2', date: string) => {
        setTableData((prev) => {
            if (prev[tableId][date]) return prev;
            const updated = { ...prev, [tableId]: { ...prev[tableId], [date]: {} } };
            debouncedSave(updated, completedTopics);
            return updated;
        });
    }, [completedTopics, debouncedSave]);

    const deleteCard = useCallback((tableId: string, date: string) => {
        setTableData((prev) => {
            const updated = JSON.parse(JSON.stringify(prev)) as TableData;
            delete updated[tableId as keyof TableData][date];
            debouncedSave(updated, completedTopics);
            return updated;
        });
    }, [completedTopics, debouncedSave]);

    return (
        <DataContext.Provider value={{
            tableData, completedTopics, settings, isLoading,
            updateTopic, addTopic, deleteTopic, updateTableData, updateSettings, addCard, deleteCard
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
