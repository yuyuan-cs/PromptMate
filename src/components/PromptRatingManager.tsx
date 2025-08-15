import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare } from 'lucide-react';
import { Prompt } from '@/types';
import { cn } from '@/lib/utils';

interface PromptRatingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onSaveRating: (rating: number, notes?: string) => void;
}

export const PromptRatingManager: React.FC<PromptRatingManagerProps> = ({
  isOpen,
  onClose,
  prompt,
  onSaveRating,
}) => {
  const [rating, setRating] = useState(prompt?.rating || 0);
  const [notes, setNotes] = useState(prompt?.ratingNotes || '');
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!prompt) return null;

  const handleSave = () => {
    onSaveRating(rating, notes.trim() || undefined);
    onClose();
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoveredStar(starValue);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const displayRating = hoveredStar || rating;

  const getRatingText = (value: number) => {
    switch (value) {
      case 1: return '很差';
      case 2: return '较差';
      case 3: return '一般';
      case 4: return '良好';
      case 5: return '优秀';
      default: return '未评分';
    }
  };

  const getRatingDescription = (value: number) => {
    switch (value) {
      case 1: return '提示词效果很差，需要大幅改进';
      case 2: return '提示词效果不佳，需要优化';
      case 3: return '提示词效果一般，可以改进';
      case 4: return '提示词效果良好，基本满足需求';
      case 5: return '提示词效果优秀，完全满足预期';
      default: return '请为这个提示词的效果打分';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            <DialogTitle>提示词评分</DialogTitle>
          </div>
          <DialogDescription>
            为提示词 "{prompt.title}" 的效果进行评分
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 星级评分 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">效果评分</Label>
            
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => handleStarHover(starValue)}
                  onMouseLeave={handleStarLeave}
                  className="p-1 rounded transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      starValue <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    )}
                  />
                </button>
              ))}
              
              <div className="ml-3 text-sm">
                <span className="font-medium">{getRatingText(displayRating)}</span>
                {displayRating > 0 && (
                  <div className="text-muted-foreground text-xs mt-1">
                    {getRatingDescription(displayRating)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 评分说明 */}
          <div className="space-y-2">
            <Label htmlFor="rating-notes" className="text-base font-medium">
              评分说明（可选）
            </Label>
            <Textarea
              id="rating-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="描述这个提示词的效果、优缺点、使用场景等..."
              className="min-h-[100px]"
            />
          </div>

          {/* 当前评分显示 */}
          {prompt.rating && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">当前评分</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
                    className={cn(
                      "h-4 w-4",
                      starValue <= prompt.rating!
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
                <span className="text-sm text-muted-foreground">
                  {getRatingText(prompt.rating)}
                </span>
              </div>
              
              {prompt.ratingNotes && (
                <div className="text-sm text-muted-foreground">
                  {prompt.ratingNotes}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={rating === 0}>
            保存评分
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
