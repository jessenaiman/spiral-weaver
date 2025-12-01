'use client';

import React from 'react';
import { Arc, Chapter, Moment, Story } from '@/lib/types';
import { SelectedItem } from './scene-weaver-app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Edit, Save, X } from 'lucide-react';

interface NarrativeContentDisplayProps {
  item: SelectedItem;
  onSave?: (updatedItem: Moment | Arc | Chapter | Story) => void;
}

function Section({ title, children, icon, isEditing, onEdit, onSave, onCancel }: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h4>
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


function renderContent(item: Moment | Arc | Chapter | Story) {
  if ('content' in item) return <p>{item.content}</p>;
  if ('synopsis' in item) return <p>{item.synopsis}</p>;
  if ('summary' in item) return <p>{item.summary}</p>;
  if ('theme' in item) return <p>Theme: {item.theme}</p>;
  return <p>No primary content available.</p>;
}

export default function NarrativeContentDisplay({ item, onSave }: NarrativeContentDisplayProps) {
  const { data } = item;

  // Edit state management
  const [editingStates, setEditingStates] = React.useState<Record<string, boolean>>({});
  const [editData, setEditData] = React.useState<any>(data);

  const startEditing = (section: string) => {
    setEditingStates(prev => ({ ...prev, [section]: true }));
  };

  const cancelEditing = (section: string) => {
    setEditingStates(prev => ({ ...prev, [section]: false }));
    setEditData(data); // Reset to original data
  };

   const saveEditing = async (section: string) => {
     setEditingStates(prev => ({ ...prev, [section]: false }));
     
     // Prepare form data for saving
     const formData = new FormData();
     formData.append('storyId', editData.storyId || '');
     formData.append('chapterId', editData.chapterId || '');
     formData.append('arcId', editData.arcId || '');
     formData.append('momentId', editData.momentId || '');
     formData.append('type', 'moment');
     
     if ('content' in editData) formData.append('content', editData.content);
     if ('title' in editData) formData.append('title', editData.title);
     if ('timeline' in editData) formData.append('timeline', JSON.stringify(editData.timeline));
     if ('themes' in editData) formData.append('themes', JSON.stringify(editData.themes));
     if ('lore' in editData) formData.append('lore', JSON.stringify(editData.lore));
     if ('subtext' in editData) formData.append('subtext', JSON.stringify(editData.subtext));
 
     // Call the server action to save the content
     const result = await import('@/app/actions').then(actions =>
       actions.saveNarrativeContentAction({ message: null, error: null }, formData)
     );
     
     if (result.error) {
       console.error('Error saving content:', result.error);
       // You might want to show an error toast here
     } else {
       // Update the parent component with the saved data
       if (onSave) {
         onSave(editData);
       }
     }
  };

  const updateField = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList>
        <TabsTrigger value="content">Content</TabsTrigger>
        {'timeline' in data && data.timeline && <TabsTrigger value="timeline">Timeline</TabsTrigger>}
        {'themes' in data && data.themes && <TabsTrigger value="themes">Themes</TabsTrigger>}
        {'lore' in data && data.lore && <TabsTrigger value="lore">Lore</TabsTrigger>}
        {'subtext' in data && data.subtext && <TabsTrigger value="subtext">Subtext</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="content" className="mt-4">
        <Section
          title="Summary"
          isEditing={editingStates['content']}
          onEdit={() => startEditing('content')}
          onSave={() => saveEditing('content')}
          onCancel={() => cancelEditing('content')}
        >
          {editingStates['content'] ? (
            <Textarea
              value={'content' in editData ? editData.content : ''}
              onChange={(e) => updateField('content', e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            renderContent(editData)
          )}
        </Section>
      </TabsContent>

      {'timeline' in editData && editData.timeline && (
        <TabsContent value="timeline" className="mt-4">
          <Section
            title="Timeline"
            isEditing={editingStates['timeline']}
            onEdit={() => startEditing('timeline')}
            onSave={() => saveEditing('timeline')}
            onCancel={() => cancelEditing('timeline')}
          >
            {editingStates['timeline'] ? (
              <div className="space-y-2">
                {editData.timeline.map((item: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-sm font-mono w-6">{i + 1}.</span>
                    <Textarea
                      value={item}
                      onChange={(e) => {
                        const newTimeline = [...editData.timeline];
                        newTimeline[i] = e.target.value;
                        updateField('timeline', newTimeline);
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-decimal list-inside">
                {editData.timeline.map((t: string, i: number) => <li key={i}>{t}</li>)}
              </ul>
            )}
          </Section>
        </TabsContent>
      )}

      {'themes' in editData && editData.themes && (
        <TabsContent value="themes" className="mt-4">
          <Section
            title="Themes"
            isEditing={editingStates['themes']}
            onEdit={() => startEditing('themes')}
            onSave={() => saveEditing('themes')}
            onCancel={() => cancelEditing('themes')}
          >
            {editingStates['themes'] ? (
              <div className="space-y-2">
                {editData.themes.map((theme: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-sm">•</span>
                    <Textarea
                      value={theme}
                      onChange={(e) => {
                        const newThemes = [...editData.themes];
                        newThemes[i] = e.target.value;
                        updateField('themes', newThemes);
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-disc list-inside">
                {editData.themes.map((t: string, i: number) => <li key={i}>{t}</li>)}
              </ul>
            )}
          </Section>
        </TabsContent>
      )}

      {'lore' in editData && editData.lore && (
        <TabsContent value="lore" className="mt-4">
          <Section
            title="Lore"
            isEditing={editingStates['lore']}
            onEdit={() => startEditing('lore')}
            onSave={() => saveEditing('lore')}
            onCancel={() => cancelEditing('lore')}
          >
            {editingStates['lore'] ? (
              <div className="space-y-2">
                {editData.lore.map((lore: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-sm">•</span>
                    <Textarea
                      value={lore}
                      onChange={(e) => {
                        const newLore = [...editData.lore];
                        newLore[i] = e.target.value;
                        updateField('lore', newLore);
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-disc list-inside">
                {editData.lore.map((l: string, i: number) => {
                  // Parse simple markdown-like bold syntax (*text* -> <strong>text</strong>)
                  const parts = l.split(/(\*[^*]+\*)/g);
                  return (
                    <li key={i}>
                      {parts.map((part, partIndex) => {
                        if (part.startsWith('*') && part.endsWith('*')) {
                          return <strong key={partIndex}>{part.slice(1, -1)}</strong>;
                        }
                        return part;
                      })}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </TabsContent>
      )}

      {'subtext' in editData && editData.subtext && (
        <TabsContent value="subtext" className="mt-4">
          <Section
            title="Subtext"
            isEditing={editingStates['subtext']}
            onEdit={() => startEditing('subtext')}
            onSave={() => saveEditing('subtext')}
            onCancel={() => cancelEditing('subtext')}
          >
            {editingStates['subtext'] ? (
              <div className="space-y-2">
                {editData.subtext.map((subtext: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-sm">•</span>
                    <Textarea
                      value={subtext}
                      onChange={(e) => {
                        const newSubtext = [...editData.subtext];
                        newSubtext[i] = e.target.value;
                        updateField('subtext', newSubtext);
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-disc list-inside">
                {editData.subtext.map((s: string, i: number) => {
                  // Parse simple markdown-like bold syntax (*text* -> <strong>text</strong>)
                  const parts = s.split(/(\*[^*]+\*)/g);
                  return (
                    <li key={i}>
                      {parts.map((part, partIndex) => {
                        if (part.startsWith('*') && part.endsWith('*')) {
                          return <strong key={partIndex}>{part.slice(1, -1)}</strong>;
                        }
                        return part;
                      })}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </TabsContent>
      )}
    </Tabs>
  );
}
