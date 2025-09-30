'use client';

import type { GenerateSceneState } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from './ui/card';
import { Icons } from './icons';
import { useFormStatus } from 'react-dom';
import { Moment } from '@/lib/types';
import { SelectedItem } from './scene-weaver-app';
import NarrativeContentDisplay from './narrative-content-display';
import SceneCard from './scene-card';
import { Separator } from './ui/separator';

interface SceneDisplayProps {
  formAction: (payload: FormData) => void;
  formState: GenerateSceneState;
  selectedItem: SelectedItem | null;
  onSelectMoment: (moment: Moment) => void;
  moments: Moment[];
}

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

export default function SceneDisplay({ formAction, formState, selectedItem, onSelectMoment, moments }: SceneDisplayProps) {
  const { data: scenes, error } = formState;
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
              {scenes ? `Generated ${scenes.length} narrative threads` : 'The generated scenes will appear here.'}
            </CardDescription>
          </div>
          <SubmitButton selectedItem={selectedItem} />
        </CardHeader>
      </form>

      <CardContent className="flex-1 pt-0">
        {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md mb-4">{error}</div>}
        
        {pending ? (
          <SceneLoading />
        ) : scenes ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {scenes.map((scene) => (
                <SceneCard 
                  key={scene.sceneId} 
                  scene={scene} 
                />
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
        ) : selectedItem ? (
           <NarrativeContentDisplay item={selectedItem} />
        ) : (
          <ScenePlaceholder />
        )}
      </CardContent>
    </Card>
  );
}
