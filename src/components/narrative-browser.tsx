'use client';

import * as React from 'react';
import { Story, Chapter, Arc, Moment } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from './icons';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface NarrativeBrowserProps {
  story: Story;
  onSelectMoment: (selection: { storyId: string; chapterId: string; arcId: string; momentId: string }) => void;
  selectedMomentId: string | null;
}

export default function NarrativeBrowser({ story, onSelectMoment, selectedMomentId }: NarrativeBrowserProps) {
  return (
    <div className="flex flex-col h-full p-2 gap-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:items-center">
      <div className="px-2 group-data-[collapsible=icon]:hidden">
        <Label htmlFor="restrictions">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icons.restrictions />
            Restriction Service
          </div>
        </Label>
        <Textarea 
          id="restrictions"
          name="restrictions"
          form="scene-generation-form"
          placeholder="e.g., 'no combat', 'focus on character dialogue'"
          className="mt-2 text-sm"
        />
      </div>

      <div className="px-2 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icons.story />
          Narrative
        </div>
      </div>
      
      <ScrollArea className="flex-1 group-data-[collapsible=icon]:hidden">
        <Accordion type="multiple" className="w-full px-2">
          {story.chapters.map((chapter) => (
            <AccordionItem value={chapter.chapterId} key={chapter.chapterId}>
              <AccordionTrigger className="font-semibold text-base">
                <div className="flex items-center gap-2">
                  <Icons.chapter className="text-muted-foreground" />
                  {chapter.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="multiple" className="pl-4">
                  {chapter.arcs.map((arc) => (
                    <AccordionItem value={arc.arcId} key={arc.arcId}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Icons.arc className="text-muted-foreground" />
                          {arc.label}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                        <ul className="space-y-1">
                          {arc.moments.map((moment) => (
                            <li key={moment.momentId}>
                              <button
                                onClick={() => onSelectMoment({
                                  storyId: story.storyId,
                                  chapterId: chapter.chapterId,
                                  arcId: arc.arcId,
                                  momentId: moment.momentId,
                                })}
                                className={cn(
                                  "w-full text-left p-2 rounded-md flex items-center gap-2 hover:bg-accent transition-colors",
                                  selectedMomentId === moment.momentId && "bg-accent text-accent-foreground"
                                )}
                              >
                                <Icons.moment className="text-primary h-4 w-4" />
                                {moment.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>

      <div className="hidden group-data-[collapsible=icon]:flex flex-col gap-2 p-2">
         <Button variant="ghost" size="icon"><Icons.restrictions /></Button>
         <Button variant="ghost" size="icon"><Icons.story /></Button>
      </div>
    </div>
  );
}
