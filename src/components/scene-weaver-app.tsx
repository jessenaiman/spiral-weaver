'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { generateSceneAction, type GenerateSceneState } from '@/app/actions';
import { Story, Moment, Chapter, Arc } from '@/lib/types';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import NarrativeBrowser from '@/components/narrative-browser';
import SceneDisplay from '@/components/scene-display';
import DiagnosticsPanel from '@/components/diagnostics-panel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Icons } from './icons';

interface SceneWeaverAppProps {
  stories: Story[];
}

const initialSceneState: GenerateSceneState = {
  data: null,
  error: null,
};

export type SelectedItem = 
  | { type: 'story'; data: Story }
  | { type: 'chapter'; data: Chapter }
  | { type: 'arc'; data: Arc }
  | { type: 'moment'; data: Moment };


export default function SceneWeaverApp({ stories }: SceneWeaverAppProps) {
  const [sceneState, sceneAction] = useActionState(generateSceneAction, initialSceneState);
  const [selectedItem, setSelectedItem] = React.useState<SelectedItem | null>(null);

  const story = stories[0]; // Assuming one story for the demo
  const allMoments = story.chapters.flatMap(c => c.arcs.flatMap(a => a.moments.map(m => ({...m, chapterId: c.id, arcId: a.id, storyId: story.id}))));
  
  const handleSelectMoment = (moment: Moment) => {
    const fullMoment = allMoments.find(m => m.id === moment.id);
    if(fullMoment) {
      setSelectedItem({ type: 'moment', data: fullMoment });
    }
  };
  
  const handleSelect = (item: SelectedItem) => {
    setSelectedItem(item);
    // Clear the generated scene when a new item is selected
    if (initialSceneState.data) {
        initialSceneState.data = null;
        initialSceneState.error = null;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="bg-card">
        <SidebarHeader>
           <div className="flex items-center gap-2 font-headline text-lg font-semibold">
            <Icons.story className="h-6 w-6 text-primary" />
            <span className="group-data-[collapsible=icon]:hidden">Scene Weaver</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NarrativeBrowser 
            story={story}
            onSelect={handleSelect}
            selectedItemId={selectedItem?.data.id}
          />
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="font-headline text-2xl font-bold tracking-tight">Dreamweaver Scene Desk</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SceneDisplay 
              formAction={sceneAction}
              formState={sceneState}
              selectedItem={selectedItem}
              onSelectMoment={handleSelectMoment}
              moments={allMoments}
            />
          </div>
          <div className="lg:col-span-1">
            {sceneState.data && sceneState.data.length > 0 ? (
              <DiagnosticsPanel scenes={sceneState.data} />
            ) : (
               <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.diagnostics />
                    Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Generate a scene to see diagnostic information.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
