'use client';

import React, { useState } from 'react';
import { Arc, Chapter, Moment, SceneDescriptor, DreamweaverPersonality, Story } from '@/lib/types';
import { SelectedItem } from './scene-weaver-app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Edit, Save, X, Plus } from 'lucide-react';
import { saveNarrativeContentAction } from '@/app/actions';

interface DreamweaverContentDisplayProps {
  item: SelectedItem;
  scenes?: SceneDescriptor[];
  onSave?: (updatedItem: Moment | Arc | Chapter | Story) => void;
}

type DreamweaverTab = 'original' | DreamweaverPersonality;

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

function renderContent(content: string) {
  return <p>{content}</p>;
}

export default function DreamweaverContentDisplay({ item, scenes, onSave }: DreamweaverContentDisplayProps) {
  const { data } = item;
  const [activeTab, setActiveTab] = useState<DreamweaverTab>('original');
  
  // Edit state management
  const [editingStates, setEditingStates] = React.useState<Record<string, boolean>>({});
  const [editData, setEditData] = React.useState<any>(data);
  const [dreamweaverContent, setDreamweaverContent] = React.useState<Record<DreamweaverPersonality, string>>({
    Luminari: scenes?.find(s => s.dreamweaverPersonality === 'Luminari')?.narrativeText || '',
    Shadow: scenes?.find(s => s.dreamweaverPersonality === 'Shadow')?.narrativeText || '',
    Chronicler: scenes?.find(s => s.dreamweaverPersonality === 'Chronicler')?.narrativeText || ''
  });
  const [dreamweaverUrls, setDreamweaverUrls] = React.useState<Record<DreamweaverPersonality, string>>({
    Luminari: '',
    Shadow: '',
    Chronicler: ''
  });

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
    const result = await saveNarrativeContentAction({ message: null, error: null }, formData);
    
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

  const updateDreamweaverContent = (personality: DreamweaverPersonality, content: string) => {
    setDreamweaverContent(prev => ({ ...prev, [personality]: content }));
  };

  const updateDreamweaverUrl = (personality: DreamweaverPersonality, url: string) => {
    setDreamweaverUrls(prev => ({ ...prev, [personality]: url }));
  };

  const createDreamweaverContent = (personality: DreamweaverPersonality) => {
    // This would trigger the generation of content for the specific Dreamweaver personality
    console.log(`Creating content for ${personality}`);
  };

  const loadDreamweaverText = (personality: DreamweaverPersonality) => {
    // This would load the existing Dreamweaver-generated text for the selected personality
    console.log(`Loading ${personality} text`);
    // In a real implementation, this would fetch the saved content for this personality
    setActiveTab(personality);
  };

  const hasSavedContent = (personality: DreamweaverPersonality) => {
    return !!dreamweaverContent[personality];
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DreamweaverTab)} className="w-full">
      <TabsList>
        <TabsTrigger value="original">ORIGINAL</TabsTrigger>
        <TabsTrigger value="Luminari">Luminari</TabsTrigger>
        <TabsTrigger value="Shadow">Shadow</TabsTrigger>
        <TabsTrigger value="Chronicler">Chronicler</TabsTrigger>
      </TabsList>
      
      {/* Original Content Tab - Always editable by user */}
      <TabsContent value="original" className="mt-4">
        <Section
          title="Original Content"
          isEditing={editingStates['original']}
          onEdit={() => startEditing('original')}
          onSave={() => saveEditing('original')}
          onCancel={() => cancelEditing('original')}
        >
          {editingStates['original'] ? (
            <Textarea
              value={'content' in editData ? editData.content : ''}
              onChange={(e) => updateField('content', e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            renderContent(editData.content)
          )}
        </Section>
        
        {/* Metadata and details that should be editable for each Dreamweaver content */}
        {'timeline' in editData && editData.timeline && (
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
        )}

        {'themes' in editData && editData.themes && (
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
        )}

        {'lore' in editData && editData.lore && (
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
        )}

        {'subtext' in editData && editData.subtext && (
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
        )}
      </TabsContent>

      {/* Dreamweaver Personality Tabs */}
      {(['Luminari', 'Shadow', 'Chronicler'] as DreamweaverPersonality[]).map(personality => (
        <TabsContent key={personality} value={personality} className="mt-4">
          <div className="space-y-4">
            {hasSavedContent(personality) ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{personality} Content</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadDreamweaverText(personality)}
                    >
                      Load {personality} Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(personality)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
                
                <Section
                  title={`${personality} Content`}
                  isEditing={editingStates[personality]}
                  onEdit={() => startEditing(personality)}
                  onSave={() => saveEditing(personality)}
                  onCancel={() => cancelEditing(personality)}
                >
                  {editingStates[personality] ? (
                    <Textarea
                      value={dreamweaverContent[personality]}
                      onChange={(e) => updateDreamweaverContent(personality, e.target.value)}
                      className="min-h-[100px]"
                    />
                  ) : (
                    renderContent(dreamweaverContent[personality])
                  )}
                </Section>
                
                {/* Customize Dreamweaver URL section */}
                <Section
                  title="Customize Dreamweaver Voice"
                  isEditing={editingStates[`${personality}-url`]}
                  onEdit={() => startEditing(`${personality}-url`)}
                  onSave={() => saveEditing(`${personality}-url`)}
                  onCancel={() => cancelEditing(`${personality}-url`)}
                >
                  {editingStates[`${personality}-url`] ? (
                    <Textarea
                      value={dreamweaverUrls[personality]}
                      onChange={(e) => updateDreamweaverUrl(personality, e.target.value)}
                      placeholder={`Enter custom URL for ${personality} voice`}
                      className="min-h-[60px]"
                    />
                  ) : (
                    <p>
                      {dreamweaverUrls[personality] ? dreamweaverUrls[personality] : `No custom voice URL set for ${personality}`}
                    </p>
                  )}
                </Section>
              </>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold mb-2">{personality} Content</h4>
                  <p className="text-muted-foreground mb-4">
                    No {personality} content generated yet. The content will be based on the ORIGINAL text.
                  </p>
                  <Button 
                    onClick={() => createDreamweaverContent(personality)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Generate {personality} Content
                  </Button>
                </div>
                
                {/* Show ORIGINAL text as readonly when no Dreamweaver content exists */}
                <div className="border rounded-md p-4">
                  <h4 className="font-semibold mb-2">Based on ORIGINAL Text</h4>
                  <div className="bg-muted p-3 rounded-md">
                    {renderContent(editData.content)}
                  </div>
                </div>
                
                {/* Customize Dreamweaver URL section */}
                <div className="border rounded-md p-4">
                  <h4 className="font-semibold mb-2">Customize {personality} Voice</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set a unique voice configuration for this Dreamweaver personality
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={dreamweaverUrls[personality]}
                      onChange={(e) => updateDreamweaverUrl(personality, e.target.value)}
                      placeholder={`Enter custom URL for ${personality} voice`}
                      className="w-full p-2 border rounded-md"
                    />
                    <Button 
                      size="sm"
                      onClick={() => updateDreamweaverUrl(personality, '')}
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}