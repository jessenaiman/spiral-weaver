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
import TestingDashboard from '@/components/testing-dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from './icons';
import { ReferenceShelf } from '@/lib/narrative-service';

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
  const formRef = React.useRef<HTMLFormElement>(null);

  const story = stories[0]; // Assuming one story for the demo
  const allMoments = story.chapters.flatMap(c => c.arcs.flatMap(a => a.moments.map(m => ({...m, chapterId: c.id, arcId: a.id, storyId: story.id}))));
  
  const handleSelectMoment = (moment: Moment) => {
    const fullMoment = allMoments.find(m => m.id === moment.id);
    if(fullMoment) {
      handleSelect({ type: 'moment', data: fullMoment });
    }
  };
  
  const handleSelect = async (item: SelectedItem) => {
    setSelectedItem(item);
    
    // If a moment is selected, automatically trigger the form action
    // to either load saved scenes or generate new ones.
    if (item.type === 'moment') {
        const referenceShelf = new ReferenceShelf();
        const savedScenes = await referenceShelf.getSavedScenesForMoment(item.data.id);
        
        if (savedScenes) {
            // If scenes are saved, just display them without calling the full action
            const newState: GenerateSceneState = { data: savedScenes, error: null, isLoadedFromSave: true };
            // This is tricky because useActionState doesn't let us set state directly.
            // A better refactor would be to separate loading from generating.
            // For now, we'll trigger the form to get the same effect.
             setTimeout(() => formRef.current?.requestSubmit(), 0);

        } else {
             // We need to trigger the form action. We can do this by submitting the form.
             // The form needs to be in the DOM and have the correct hidden values.
             setTimeout(() => formRef.current?.requestSubmit(), 0);
        }
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

      {/* Hidden form to trigger action */}
      <form ref={formRef} action={sceneAction} style={{ display: 'none' }}>
        {selectedItem?.type === 'moment' && (
          <>
            <input type="hidden" name="storyId" value={selectedItem.data.storyId} />
            <input type="hidden" name="chapterId" value={selectedItem.data.chapterId} />
            <input type="hidden" name="arcId" value={selectedItem.data.arcId} />
            <input type="hidden" name="momentId" value={selectedItem.data.id} />
             <label htmlFor="restrictions" className="sr-only">Content Restrictions</label>
             <textarea
               id="restrictions"
               name="restrictions"
               placeholder="Enter any content restrictions or special instructions..."
               defaultValue={
                 document.querySelector<HTMLTextAreaElement>('#restrictions')?.value
               }
               className="sr-only"
             />
          </>
        )}
      </form>


      <SidebarInset className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="font-headline text-2xl font-bold tracking-tight">Spiral Weaver</h1>
          </div>
        </div>

        <Tabs defaultValue="weaver" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weaver">Scene Weaver</TabsTrigger>
            <TabsTrigger value="testing">Bug Squashing Game</TabsTrigger>
          </TabsList>

          <TabsContent value="weaver" className="mt-6">
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
          </TabsContent>

          <TabsContent value="testing" className="mt-6">
            <TestingDashboard />
          </TabsContent>
        </Tabs>
      </SidebarInset>
    </SidebarProvider>
  );
}
