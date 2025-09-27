'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { generateSceneAction, type FormState } from '@/app/actions';
import { Story, Chapter, Arc, Moment } from '@/lib/types';
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

const initialState: FormState = {
  data: null,
  error: null,
};

export default function SceneWeaverApp({ stories }: SceneWeaverAppProps) {
  const [formState, formAction] = useFormState(generateSceneAction, initialState);
  const [selectedMoment, setSelectedMoment] = React.useState<{
    storyId: string;
    chapterId: string;
    arcId: string;
    momentId: string;
  } | null>(null);

  const story = stories[0]; // Assuming one story for the demo

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
            onSelectMoment={setSelectedMoment}
            selectedMomentId={selectedMoment?.momentId}
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
              formAction={formAction}
              formState={formState}
              selectedMoment={selectedMoment}
            />
          </div>
          <div className="lg:col-span-1">
            {formState.data ? (
              <DiagnosticsPanel diagnostics={formState.data.diagnostics} />
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
