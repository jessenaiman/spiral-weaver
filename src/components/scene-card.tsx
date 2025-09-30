import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SceneDescriptor } from '@/lib/types';
import { Icons } from './icons';

interface SceneCardProps {
  scene: SceneDescriptor;
  onBranchClick: (targetMomentId: string) => void;
  dreamweaverPersonality: string;
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

export default function SceneCard({ scene, onBranchClick, dreamweaverPersonality }: SceneCardProps) {
  const style = personalityStyles[dreamweaverPersonality as keyof typeof personalityStyles] || '';
  const icon = personalityIcons[dreamweaverPersonality as keyof typeof personalityIcons] || '🎭';
  
  return (
    <Card className={`flex flex-col ${style}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>{icon}</span>
            {dreamweaverPersonality}
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
        
        {scene.branchOptions && scene.branchOptions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm"><Icons.chapter /> Branch Options</h4>
              <div className="flex flex-wrap gap-2">
                {scene.branchOptions.map((option, i) => (
                  <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => onBranchClick(option.targetMomentId)}>
                    {option.prompt}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
