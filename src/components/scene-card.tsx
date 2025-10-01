import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SceneDescriptor } from '@/lib/types';
import { Icons } from './icons';

interface SceneCardProps {
  scene: SceneDescriptor;
}

const personalityStyles = {
  Luminari: 'border-blue-500/50',
  Shadow: 'border-red-500/50',
  Chronicler: 'border-gray-500/50',
};

const personalityIcons = {
    Luminari: '✨',
    Shadow: '💀',
    Chronicler: '📚',
}

export default function SceneCard({ scene }: SceneCardProps) {
  const style = personalityStyles[scene.dreamweaverPersonality] || '';
  const icon = personalityIcons[scene.dreamweaverPersonality] || '🎭';
  
  return (
    <Card className={`flex flex-col ${style}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>{icon}</span>
            {scene.dreamweaverPersonality}
          </div>
          <Badge variant="outline">Mood: {scene.mood}</Badge>
        </CardTitle>
        <CardDescription>{scene.title}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm"><Icons.narrative /> Narrative Text</h4>
          <p className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none text-xs">{scene.narrativeText}</p>
        </div>
      </CardContent>
    </Card>
  );
}
