'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icons } from './icons';
import { agentSystem } from '@/ai/qwen-agents';

interface ContentEditorProps {
  initialContent?: string;
  contentType?: 'narrative' | 'scene' | 'moment';
  onContentChange?: (content: string) => void;
  className?: string;
}

interface AIRecommendation {
  id: string;
  type: 'style' | 'grammar' | 'plot' | 'character' | 'engagement';
  suggestion: string;
  confidence: number;
  reasoning: string;
}

export default function ContentEditor({
  initialContent = '',
  contentType = 'narrative',
  onContentChange,
  className
}: ContentEditorProps) {
  const [content, setContent] = React.useState(initialContent);
  const [recommendations, setRecommendations] = React.useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = React.useState<string | null>(null);

  const analyzeContent = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      // Use the content suggester agent to get recommendations
      const analysis = await agentSystem.generateEnhancedScene({
        content,
        contentType,
        analysisMode: 'editing'
      });

      const aiRecommendations: AIRecommendation[] = analysis.suggestions.map((suggestion: any, index: number) => ({
        id: `rec_${Date.now()}_${index}`,
        type: suggestion.type || 'style',
        suggestion: suggestion.text,
        confidence: suggestion.confidence || 0.8,
        reasoning: suggestion.reasoning || 'AI-powered content improvement'
      }));

      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyRecommendation = (recommendation: AIRecommendation) => {
    setSelectedRecommendation(recommendation.id);

    // Apply the suggestion to the content
    let newContent = content;

    switch (recommendation.type) {
      case 'style':
        // Apply style improvements
        newContent = recommendation.suggestion;
        break;
      case 'grammar':
        // Apply grammar fixes
        newContent = recommendation.suggestion;
        break;
      case 'plot':
        // Suggest plot improvements (show as options)
        newContent = `${content}\n\n[Plot Suggestion: ${recommendation.suggestion}]`;
        break;
      case 'character':
        // Suggest character development
        newContent = `${content}\n\n[Character Suggestion: ${recommendation.suggestion}]`;
        break;
      case 'engagement':
        // Suggest engagement improvements
        newContent = `${content}\n\n[Engagement Suggestion: ${recommendation.suggestion}]`;
        break;
    }

    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);

    // Clear recommendations when content changes significantly
    if (newContent.length > content.length + 50 || newContent.length < content.length - 50) {
      setRecommendations([]);
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'style': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'grammar': return 'bg-green-100 text-green-800 border-green-200';
      case 'plot': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'character': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'engagement': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.narrative className="h-5 w-5" />
              Content Editor ({contentType})
            </div>
            <Button
              onClick={analyzeContent}
              disabled={isAnalyzing || !content.trim()}
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
                  Get AI Suggestions
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`Enter your ${contentType} content here...`}
            className="min-h-[200px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.sparkles className="h-5 w-5 text-blue-500" />
              AI Recommendations ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedRecommendation === rec.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedRecommendation(
                  selectedRecommendation === rec.id ? null : rec.id
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getRecommendationColor(rec.type)}>
                      {rec.type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>

                <p className="text-sm mb-2">{rec.suggestion}</p>

                {rec.reasoning && (
                  <p className="text-xs text-muted-foreground">
                    {rec.reasoning}
                  </p>
                )}

                {selectedRecommendation === rec.id && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRecommendation(rec);
                      }}
                    >
                      Apply Suggestion
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecommendation(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const words = content.split(' ').length;
                const readingTime = Math.ceil(words / 200);
                alert(`Estimated reading time: ${readingTime} minutes`);
              }}
            >
              Reading Time
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const sentences = content.split(/[.!?]+/).length - 1;
                alert(`Sentence count: ${sentences}`);
              }}
            >
              Count Sentences
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(content);
              }}
            >
              Copy Content
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}