'use client';

import React from 'react';
import { Moment, Arc } from '@/lib/types';
import { SelectedItem } from './scene-weaver-app';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Edit, Save, X } from 'lucide-react';

interface ArcContentDisplayProps {
  item: SelectedItem & { type: 'arc' };
  onSave?: (updatedItem: Arc) => void;
}

function Section({ title, children, isEditing, onEdit, onSave, onCancel }: {
  title: string;
  children: React.ReactNode;
  isEditing?: boolean;
  onEdit?: () => void;
 onSave?: () => void;
  onCancel?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{title}</h4>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>
      <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none space-y-2">
        {children}
      </div>
    </div>
 );
}

function MomentDisplay({ moment }: { moment: Moment }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editMoment, setEditMoment] = React.useState<Moment>(moment);

    const startEditing = () => setIsEditing(true);
    const cancelEditing = () => {
        setIsEditing(false);
        setEditMoment(moment); // Reset to original
    };
    const saveEditing = async () => {
        setIsEditing(false);
        
        // Prepare form data for saving
        const formData = new FormData();
        formData.append('storyId', editMoment.storyId);
        formData.append('chapterId', editMoment.chapterId);
        formData.append('arcId', editMoment.arcId);
        formData.append('momentId', editMoment.momentId);
        formData.append('type', 'moment');
        formData.append('content', editMoment.content);
        formData.append('title', editMoment.title);

        // Call the server action to save the content
        const result = await import('@/app/actions').then(actions =>
            actions.saveNarrativeContentAction({ message: null, error: null }, formData)
        );
        
        if (result.error) {
            console.error('Error saving moment:', result.error);
            // You might want to show an error toast here
        }
    };

    const updateField = (field: string, value: any) => {
        setEditMoment((prev: Moment) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
                {isEditing ? (
                    <input
                        type="text"
                        value={editMoment.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="text-lg font-bold border rounded px-2 py-1 flex-1 mr-2 bg-background text-foreground"
                    />
                ) : (
                    <h3 className="font-bold text-base">{editMoment.title}</h3>
                )}
                {!isEditing ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={startEditing}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={saveEditing}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </div>
                )}
            </div>
            {isEditing ? (
                <textarea
                    value={editMoment.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    className="w-full min-h-[100px] border rounded p-2 text-sm bg-background text-foreground"
                />
            ) : (
                <p className="text-sm text-muted-foreground">{editMoment.content}</p>
            )}
        </div>
    )
}

export default function ArcContentDisplay({ item, onSave }: ArcContentDisplayProps) {
  const { data: arc } = item;

  // Edit state management
  const [editingStates, setEditingStates] = React.useState<Record<string, boolean>>({});
  const [editData, setEditData] = React.useState<Arc>(arc);

  const startEditing = (section: string) => {
    setEditingStates(prev => ({ ...prev, [section]: true }));
  };

  const cancelEditing = (section: string) => {
    setEditingStates(prev => ({ ...prev, [section]: false }));
    setEditData(arc); // Reset to original data
  };

  const saveEditing = (section: string) => {
    setEditingStates(prev => ({ ...prev, [section]: false }));
    if (onSave) {
      onSave(editData);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditData((prev: Arc) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollArea className="h-[60vh] p-1">
        <div className="space-y-4">
            <Section
              title="Theme"
              isEditing={editingStates['theme']}
              onEdit={() => startEditing('theme')}
              onSave={() => saveEditing('theme')}
              onCancel={() => cancelEditing('theme')}
            >
              {editingStates['theme'] ? (
                <Textarea
                  value={editData.theme}
                  onChange={(e) => updateField('theme', e.target.value)}
                  className="min-h-[100px]"
                />
              ) : (
                <p>{editData.theme}</p>
              )}
            </Section>
            <Separator />
            <h3 className="text-lg font-semibold tracking-tight">Moments</h3>
            <div className="space-y-4">
                {editData.moments.map(moment => (
                    <MomentDisplay key={moment.id} moment={moment} />
                ))}
            </div>
        </div>
    </ScrollArea>
  );
}
