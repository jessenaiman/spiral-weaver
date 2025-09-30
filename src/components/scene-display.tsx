'use client';

import type { FormState } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Icons } from './icons';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useFormStatus } from 'react-dom';
import { Moment } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SelectedItem } from './scene-weaver-app';
import NarrativeContentDisplay from './narrative-content-display';

interface SceneDisplayProps {
  formAction: (payload: FormData) => void;
  formState: FormState;
  selectedItem: SelectedItem | null;
  onSelectMoment: (moment: Moment) => void;
  moments: Moment[];
}

function ScenePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
      <Icons.narrative className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Select an Item</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a story, chapter, arc, or moment from the narrative browser on the left to see its details.
      </p>
    </div>
  );
}

function SceneLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg animate-pulse">
      <Icons.spinner className="h-12 w-12 text-primary animate-spin" />
      <h3 className="mt-4 text-lg font-semibold">The Dreamweaver is weaving...</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        A new narrative is being generated based on your selection. This might take a moment.
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
      Generate Scene
    </Button>
  );
}

export default function SceneDisplay({ formAction, formState, selectedItem, onSelectMoment, moments }: SceneDisplayProps) {
  const { data: scene, error } = formState;
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
            <CardTitle className="font-headline text-2xl">{scene?.title ?? selectedItem?.data.title ?? 'Scene Display'}</CardTitle>
            <CardDescription>{scene ? `Scene ID: ${scene.sceneId}` : 'The generated scene will appear here.'}</CardDescription>
          </div>
          <SubmitButton selectedItem={selectedItem} />
        </CardHeader>
      </form>

      <CardContent className="flex-1">
        {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>}
        
        {pending ? (
          <SceneLoading />
        ) : scene ? (
          <div className="space-y-6 mt-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Icons.narrative /> Narrative Text</h4>
              <p className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">{scene.narrativeText}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Badge variant="outline">Mood: {scene.mood}</Badge></div>
            </div>
            
              {scene.branchOptions && scene.branchOptions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2"><Icons.chapter /> Branch Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {scene.branchOptions.map((option, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => handleBranchClick(option.targetMomentId)}>
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
