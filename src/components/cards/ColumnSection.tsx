import React from 'react';
import { TopicItem } from './TopicItem';
import { Topic } from '@/types';

interface ColumnSectionProps {
    columnName: string;
    topicIds: string[];
    completedTopics: Record<string, Topic>;
    tableId: string;
    onEditTopic: (topicId: string) => void;
}

export const ColumnSection: React.FC<ColumnSectionProps> = ({
    columnName,
    topicIds,
    completedTopics,
    tableId,
    onEditTopic
}) => {
    const colorClass = tableId === 'table1'
        ? 'bg-accent-green/20 text-accent-green border-accent-green'
        : 'bg-accent-blue/20 text-accent-blue border-accent-blue';

    return (
        <div className="py-2 px-4 border-b border-border last:border-b-0">
            <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2 py-1 rounded border mb-2 ${colorClass}`}>
                {columnName}
            </span>

            <div className="space-y-1">
                {topicIds.map((topicId) => {
                    const topic = completedTopics[topicId];
                    if (!topic) return null;
                    return (
                        <TopicItem
                            key={topicId}
                            topicId={topicId}
                            topic={topic}
                            onEdit={onEditTopic}
                        />
                    );
                })}
            </div>
        </div>
    );
};
