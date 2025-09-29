'use client';

import { Arc, Chapter, Moment, Story } from '@/lib/types';
import { SelectedItem } from './scene-weaver-app';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Icons } from './icons';

interface NarrativeContentDisplayProps {
  item: SelectedItem;
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold flex items-center gap-2 mb-2">
        {icon}
        {title}
      </h4>
      <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none space-y-2">
        {children}
      </div>
    </div>
  );
}


function renderContent(item: Moment | Arc | Chapter | Story) {
  if ('content' in item) return <p>{item.content}</p>;
  if ('synopsis' in item) return <p>{item.synopsis}</p>;
  if ('summary' in item) return <p>{item.summary}</p>;
  if ('theme' in item) return <p>Theme: {item.theme}</p>;
  return <p>No primary content available.</p>;
}

export default function NarrativeContentDisplay({ item }: NarrativeContentDisplayProps) {
  const { data } = item;

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList>
        <TabsTrigger value="content">Content</TabsTrigger>
        {'timeline' in data && data.timeline && <TabsTrigger value="timeline">Timeline</TabsTrigger>}
        {'themes' in data && data.themes && <TabsTrigger value="themes">Themes</TabsTrigger>}
        {'lore' in data && data.lore && <TabsTrigger value="lore">Lore</TabsTrigger>}
        {'subtext' in data && data.subtext && <TabsTrigger value="subtext">Subtext</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="content" className="mt-4">
        <Section title="Summary">
            {renderContent(data)}
        </Section>
      </TabsContent>

      {'timeline' in data && data.timeline && (
        <TabsContent value="timeline" className="mt-4">
          <Section title="Timeline">
            <ul className="list-decimal list-inside">
              {data.timeline.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </Section>
        </TabsContent>
      )}

      {'themes' in data && data.themes && (
        <TabsContent value="themes" className="mt-4">
          <Section title="Themes">
            <ul className="list-disc list-inside">
              {data.themes.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </Section>
        </TabsContent>
      )}

      {'lore' in data && data.lore && (
        <TabsContent value="lore" className="mt-4">
          <Section title="Lore">
            <ul className="list-disc list-inside">
              {data.lore.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: l.replace(/\*(.*?)\*/g, '<strong>$1</strong>') }}></li>)}
            </ul>
          </Section>
        </TabsContent>
      )}

      {'subtext' in data && data.subtext && (
        <TabsContent value="subtext" className="mt-4">
          <Section title="Subtext">
            <ul className="list-disc list-inside">
              {data.subtext.map((s, i) => <li key={i} dangerouslySetInnerHTML={{ __html: s.replace(/\*(.*?)\*/g, '<strong>$1</strong>') }}></li>)}
            </ul>
          </Section>
        </TabsContent>
      )}
    </Tabs>
  );
}
