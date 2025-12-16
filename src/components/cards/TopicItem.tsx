import React from 'react';
import { Topic } from '@/types';
import { ProgressBox } from '@/components/common/ProgressBox';
import { HARDNESS_MAP, STUDY_TYPE_CLASSES, PRIORITY_CLASSES } from '@/constants';
import { useData } from '@/contexts/DataContext';

interface TopicItemProps {
    topicId: string;
    topic: Topic;
    onEdit: (topicId: string) => void;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topicId, topic, onEdit }) => {
    const { updateTopic, settings } = useData();

    const handleProgressChange = (id: string, newProgress: number) => {
        updateTopic(id, { progress: newProgress });
    };

    const studyType = settings.customStudyTypes.find((t) => t.key === topic.studyStatus);
    const studyTypeClass = STUDY_TYPE_CLASSES[topic.studyStatus] || STUDY_TYPE_CLASSES.custom;

    return (
        <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group">
            {/* Priority Indicator */}
            <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_CLASSES[topic.priority]}`}
                title={`Priority: ${topic.priority}`}
            />

            {/* Progress Box */}
            <ProgressBox
                progress={topic.progress}
                topicId={topicId}
                onProgressChange={handleProgressChange}
            />

            {/* Topic Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium truncate">{topic.name}</span>
                    <span className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded border ${STUDY_TYPE_CLASSES[topic.hardness] || 'border-border text-gray-400'}`}>
                        {HARDNESS_MAP[topic.hardness]}
                    </span>
                    <span className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded border max-w-[70px] truncate ${studyTypeClass}`}>
                        {studyType?.name || topic.studyStatus}
                    </span>
                </div>
                {topic.timedNote && (
                    <span className="text-xs text-gray-500 italic">{topic.timedNote}</span>
                )}
            </div>

            {/* Edit Button */}
            <button
                onClick={() => onEdit(topicId)}
                className={`p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${topic.note ? 'text-accent-gold hover:bg-accent-gold/20' : 'text-gray-400 hover:bg-bg-hover hover:text-white'}`}
                title={topic.note || 'Edit topic'}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </button>
        </div>
    );
};
