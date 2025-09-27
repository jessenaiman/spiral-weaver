import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SceneDiagnostics } from '@/lib/types';
import { Icons } from './icons';

interface DiagnosticsPanelProps {
  diagnostics: SceneDiagnostics;
}

export default function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.diagnostics />
          Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
