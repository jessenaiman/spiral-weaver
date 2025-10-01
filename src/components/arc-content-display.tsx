'use client';

import { Moment } from '@/lib/types';
import { SelectedItem } from './scene-weaver-app';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface ArcContentDisplayProps {
  item: SelectedItem & { type: 'arc' };
}

function Section({ title, children }: { title: string; children: React.ReactNode; }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none space-y-2">
        {children}
      </div>
    </div>
  );
}

function MomentDisplay({ moment }: { moment: Moment }) {
    return (
        <div className="p-4 border rounded-lg">
            <h3 className="font-bold text-base mb-2">{moment.title}</h3>
            <p className="text-sm text-muted-foreground">{moment.content}</p>
        </div>
    )
}

export default function ArcContentDisplay({ item }: ArcContentDisplayProps) {
  const { data: arc } = item;

  return (
    <ScrollArea className="h-[60vh] p-1">
        <div className="space-y-4">
            <Section title="Theme">
                <p>{arc.theme}</p>
            </Section>
            <Separator />
            <h3 className="text-lg font-semibold tracking-tight">Moments</h3>
            <div className="space-y-4">
                {arc.moments.map(moment => (
                    <MomentDisplay key={moment.id} moment={moment} />
                ))}
            </div>
        </div>
    </ScrollArea>
  );
}
