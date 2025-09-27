'use client';

import type { FormState } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Icons } from './icons';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useFormStatus } from 'react-dom';

interface SceneDisplayProps {
  formAction: (payload: FormData) => void,
  formState: FormState;
  selectedMoment: { storyId: string; chapterId: string; arcId: string; momentId: string } | null;
}

function ScenePlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
            <Icons.narrative className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Select a Moment</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Choose a moment from the narrative browser on the left and click 'Generate Scene' to begin.
            </p>
        </div>
    );
}

function SceneLoading() {
     return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg animate-pulse">
            <Icons.spinner className="h-12 w-12 text-primary animate-spin" />
            <h3 className="mt-4 text-lg font-semibold">Weaving the narrative...</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                The Dreamweaver is assembling your scene. This might take a moment.
            </p>
        </div>
    );
}

function SubmitButton({ selectedMoment }: { selectedMoment: SceneDisplayProps['selectedMoment'] }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={!selectedMoment || pending}>
      <Icons.sparkles className="mr-2 h-4 w-4" />
      Generate Scene
    </Button>
  );
}


export default function SceneDisplay({ formAction, formState, selectedMoment }: SceneDisplayProps) {
  const { data: scene, error } = formState;
  const { pending } = useFormStatus();

  return (
    <Card className="h-full flex flex-col">
      <form id="scene-generation-form" action={formAction}>
        {selectedMoment && (
          <>
            <input type="hidden" name="storyId" value={selectedMoment.storyId} />
            <input type="hidden" name="chapterId" value={selectedMoment.chapterId} />
            <input type="hidden" name="arcId" value={selectedMoment.arcId} />
            <input type="hidden" name="momentId" value={selectedMoment.momentId} />
          </>
        )}
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">{scene?.title ?? 'Scene Display'}</CardTitle>
            <CardDescription>{scene ? `Scene ID: ${scene.sceneId}` : 'The generated scene will appear here.'}</CardDescription>
          </div>
          <SubmitButton selectedMoment={selectedMoment} />
        </CardHeader>
      </form>

      <CardContent className="flex-1">
        {error && <div className="text-destructive p-4 bg-destructive/10 rounded-md">{error}</div>}
        
        {pending ? (
            <SceneLoading />
        ) : !scene ? (
            <ScenePlaceholder />
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Icons.narrative /> Narrative Text</h4>
              <p className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">{scene.narrativeText}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Badge variant="outline">Mood: {scene.mood}</Badge></div>
              <div><Badge variant="outline">Choices: {scene.recommendedChoices.join(', ') || 'None'}</Badge></div>
            </div>

            <Separator />
            
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Icons.party /> Party Highlights</h4>
              {scene.partyHighlights.length > 0 ? (
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    {scene.partyHighlights.map((highlight, i) => <li key={i}>{highlight}</li>)}
                </ul>
              ) : <p className="text-muted-foreground text-sm">No specific party highlights.</p>}
            </div>

            <Separator />

             <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Icons.equipment /> Equipment Highlights</h4>
              {scene.equipmentHighlights.length > 0 ? (
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    {scene.equipmentHighlights.map((item, i) => <li key={i}><b>{item.name}:</b> {item.usageNotes}</li>)}
                </ul>
              ) : <p className="text-muted-foreground text-sm">No specific equipment highlights.</p>}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
