'use client';

import * as React from 'react';
import { useTransition } from 'react';
import type { GenerateSceneState, SaveScenesState } from '@/app/actions';
import { saveScenesAction } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from './ui/card';
import { Icons } from './icons';
import { useFormStatus } from 'react-dom';
import { Moment } from '@/lib/types';
import { SelectedItem } from './scene-weaver-app';
import NarrativeContentDisplay from './narrative-content-display';
import ArcContentDisplay from './arc-content-display';
import SceneCard from './scene-card';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface SceneDisplayProps {
  formAction: (payload: FormData) => void;
  formState: GenerateSceneState;
  selectedItem: SelectedItem | null;
  onSelectMoment: (moment: Moment) => void;
  moments: Moment[];
}

const initialSaveState: SaveScenesState = { message: null, error: null };

function ScenePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
      <Icons.narrative className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Select a Moment</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a moment from the narrative browser on the left to generate scenes.
      </p>
    </div>
  );
}

function SceneLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg animate-pulse">
      <Icons.spinner className="h-12 w-12 text-primary animate-spin" />
      <h3 className="mt-4 text-lg font-semibold">The Dreamweavers are weaving...</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Three new narratives are being generated based on your selection. This might take a moment.
      </p>
    </div>
  );
}

function SubmitButton({ selectedItem }: { selectedItem: SceneDisplayProps['selectedItem'] }) {
  const { pending } = useFormStatus();
  const isMoment = selectedItem?.type === 'moment';
  return (
    <Button type="submit" disabled={!isMoment || pending}>
      <Icons.sparkles className="mr-2 h-4 w-4" />
      Generate Scenes
    </Button>
  );
}

function SaveScenesButton({ scenes, momentId }: { scenes: GenerateSceneState['data'], momentId: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSave = () => {
        const formData = new FormData();
        formData.append('momentId', momentId);
        formData.append('scenes', JSON.stringify(scenes));

        startTransition(async () => {
            const result = await saveScenesAction(initialSaveState, formData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Success', description: result.message });
            }
        });
    };

    return (
        <Button onClick={handleSave} disabled={isPending} variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Saving...' : 'Save Scenes'}
        </Button>
    );
}


export default function SceneDisplay({ formAction, formState, selectedItem, onSelectMoment, moments }: SceneDisplayProps) {
  const { data: scenes, error, isLoadedFromSave } = formState;
  const { pending } = useFormStatus();
  
  const currentMoment = selectedItem?.type === 'moment' ? selectedItem.data : null;

  const handleBranchClick = (targetMomentId: string) => {
    const targetMoment = moments.find(m => m.id === targetMomentId);
    if (targetMoment) {
      onSelectMoment(targetMoment);

      setTimeout(() => {
        const form = document.getElementById('scene-generation-form') as HTMLFormElement;
        if (form) {
            const formData = new FormData(form);
            formData.set('momentId', targetMoment.id);
            formData.set('chapterId', targetMoment.chapterId);
            formData.set('arcId', targetMoment.arcId);
            formAction(formData);
        }
      }, 0);
    }
  };

  const branchOptions = scenes?.[0]?.branchOptions;

  const renderContent = () => {
    if (pending) {
      return <SceneLoading />;
    }
    if (error) {
      return <div className="text-destructive p-4 bg-destructive/10 rounded-md mb-4">{error}</div>;
    }
    if (scenes) {
      return (
        <div className="space-y-6">
          {isLoadedFromSave && (
            <div className="p-2 text-sm text-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-md">
                Loaded previously saved scenes for this moment.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <SceneCard key={scene.sceneId} scene={scene} />
            ))}
          </div>

          {branchOptions && branchOptions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm"><Icons.chapter /> Branch Options</h4>
                <div className="flex flex-wrap gap-2">
                  {branchOptions.map((option, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => handleBranchClick(option.targetMomentId)}>
                      {option.prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    if (selectedItem?.type === 'arc') {
        return <ArcContentDisplay item={selectedItem} />;
    }
    if (selectedItem) {
        return <NarrativeContentDisplay item={selectedItem} />;
    }
    return <ScenePlaceholder />;
  };

  return (
    <Card className="h-full flex flex-col">
      <form id="scene-generation-form" action={formAction}>
        {currentMoment && (
          <>
            <input type="hidden" name="storyId" value={currentMoment.storyId} />
            <input type="hidden" name="chapterId" value={currentMoment.chapterId} />
            <input type="hidden" name="arcId" value={currentMoment.arcId} />
            <input type="hidden" name="momentId" value={currentMoment.id} />
          </>
        )}
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">{selectedItem?.data.title ?? 'Scene Display'}</CardTitle>
            <CardDescription>
              {scenes ? (isLoadedFromSave ? 'Loaded saved scenes' : `Generated ${scenes.length} narrative threads`) : 'The generated scenes will appear here.'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {scenes && !isLoadedFromSave && currentMoment && (
              <SaveScenesButton scenes={scenes} momentId={currentMoment.id} />
            )}
            <SubmitButton selectedItem={selectedItem} />
          </div>
        </CardHeader>
      </form>

      <CardContent className="flex-1 pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
