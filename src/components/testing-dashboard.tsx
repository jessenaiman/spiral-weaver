'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from './icons';
import { testingSystem, BugReport, CoverageGap, QualityMetrics } from '@/lib/agent-testing-system';

interface TestingDashboardProps {
  className?: string;
}

export default function TestingDashboard({ className }: TestingDashboardProps) {
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    // Load initial dashboard data
    setDashboardData(testingSystem.getDashboardData());

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      setDashboardData(testingSystem.getDashboardData());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const runQualityAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // This would typically run analysis on current content
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDashboardData(testingSystem.getDashboardData());
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!dashboardData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Icons.spinner className="animate-spin h-6 w-6" />
            <span className="ml-2">Loading testing dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Bug Squashing Game Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.diagnostics className="h-5 w-5" />
              Bug Squashing Game Dashboard
            </div>
            <Button
              onClick={runQualityAnalysis}
              disabled={isAnalyzing}
              size="sm"
              variant="outline"
            >
              {isAnalyzing ? (
                <>
                  <Icons.spinner className="animate-spin h-4 w-4 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Icons.ai className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Bug Count */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {dashboardData.bugCount}
              </div>
              <div className="text-sm text-muted-foreground">Active Bugs</div>
              <div className="text-xs text-muted-foreground">
                {dashboardData.trends.bugsLast24h} in last 24h
              </div>
            </div>

            {/* Coverage Gaps */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.coverageGapCount}
              </div>
              <div className="text-sm text-muted-foreground">Coverage Gaps</div>
              <div className="text-xs text-muted-foreground">
                {dashboardData.trends.gapsLast24h} in last 24h
              </div>
            </div>

            {/* Quality Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((dashboardData.qualityMetrics?.overallScore || 0) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Quality Score</div>
              <div className="text-xs text-muted-foreground">
                AI Assessment
              </div>
            </div>

            {/* Test Coverage */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                75%
              </div>
              <div className="text-sm text-muted-foreground">Coverage</div>
              <div className="text-xs text-muted-foreground">
                Target: 90%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Breakdown */}
      {dashboardData.qualityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardData.qualityMetrics.categories).map(([category, score]) => (
                <div key={category} className="text-center">
                  <div className="text-lg font-semibold">
                    {Math.round(score * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bugs */}
      {dashboardData.recentBugs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icons.diagnostics className="h-5 w-5 text-red-500" />
              Recent Bugs ({dashboardData.recentBugs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentBugs.map((bug: BugReport) => (
              <div key={bug.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getSeverityColor(bug.severity)}>
                      {bug.severity}
                    </Badge>
                    <Badge variant="outline">{bug.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {bug.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{bug.description}</p>
                  {bug.suggestedFix && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Fix: {bug.suggestedFix}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round(bug.confidence * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">confidence</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Coverage Gaps */}
      {dashboardData.recentGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icons.moment className="h-5 w-5 text-orange-500" />
              Coverage Gaps ({dashboardData.recentGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentGaps.map((gap: CoverageGap) => (
              <div key={gap.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getPriorityColor(gap.priority)}>
                      {gap.priority}
                    </Badge>
                    <Badge variant="outline">{gap.area}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {gap.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{gap.description}</p>
                  {gap.suggestedTest && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Test: {gap.suggestedTest}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {dashboardData.qualityMetrics?.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dashboardData.qualityMetrics.recommendations.slice(0, 5).map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Icons.sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}