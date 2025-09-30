
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { reviewScenesAction, type ReviewState } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SceneDescriptor, SceneDiagnostics } from '@/lib/types';
import { Icons } from './icons';
import { Button } from './ui/button';
import { useFormStatus } from 'react-dom';

interface DiagnosticsPanelProps {
  scenes: SceneDescriptor[];
}

const initialReviewState: ReviewState = {
  data: null,
  error: null,
};

function ReviewSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm" variant="outline">
       {pending ? (
        <>
          <Icons.spinner className="mr-2 animate-spin" />
          Reviewing...
        </>
      ) : (
        <>
          <Icons.dreamweaver className="mr-2" />
          Review Scenes
        </>
      )}
    </Button>
  );
}

export default function DiagnosticsPanel({ scenes }: DiagnosticsPanelProps) {
  const [reviewState, reviewAction] = useActionState(reviewScenesAction, initialReviewState);

  const diagnostics = scenes[0].diagnostics;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Icons.diagnostics />
            Diagnostics
          </CardTitle>
        </div>
        <form action={reviewAction}>
          <input type="hidden" name="scene1" value={scenes[0]?.narrativeText ?? ''} />
          <input type="hidden" name="scene2" value={scenes[1]?.narrativeText ?? ''} />
          <input type="hidden" name="scene3" value={scenes[2]?.narrativeText ?? ''} />
          <ReviewSubmitButton />
        </form>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {reviewState.error && <p className="text-destructive">{reviewState.error}</p>}
        {reviewState.data && (
          <div>
            <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
              <Icons.dreamweaver />
              Reviewer Feedback
            </h4>
            <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none space-y-2">
              <p>{reviewState.data}</p>
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
            <Icons.restrictions />
            Applied Restrictions
          </h4>
          {diagnostics.appliedRestrictions?.length > 0 ? (
            <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
              {diagnostics.appliedRestrictions.map((restriction, i) => (
                <li key={i}>{restriction}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">No restrictions applied.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
            <Icons.moment />
            Mood Adjustments
          </h4>
          {diagnostics.moodAdjustments?.length > 0 ? (
             <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
              {diagnostics.moodAdjustments.map((adj, i) => (
                <li key={i}>{adj}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">No mood adjustments made.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
            <Icons.chapter />
            Branch Forecast
          </h4>
          <p className="text-muted-foreground text-xs">
            {diagnostics.branchForecast || 'No branch forecast available.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
