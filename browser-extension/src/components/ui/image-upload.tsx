import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { cn } from "../../lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  autoSave?: boolean;
  onImageChange?: () => void;
}

export function ImageUpload({ 
  value, 
  onChange, 
  className, 
  autoSave = true,
  onImageChange 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value || undefined);

  // 当外部value变化时更新预�?
  useEffect(() => {
    setPreviewUrl(value || undefined);
  }, [value]);

  // 处理文件上传
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小�?MB 以内�?
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      onChange(dataUrl);
      
      if (autoSave && onImageChange) {
        onImageChange();
      }
    };
    reader.readAsDataURL(file);
    
    // 清除文件输入，以便同一文件可以再次触发change事件
    if (event.target) {
      event.target.value = '';
    }
  };

  // 删除图片
  const handleDeleteImage = () => {
    setPreviewUrl(undefined);
    onChange(undefined);
    
    if (autoSave && onImageChange) {
      onImageChange();
    }
  };

  // 触发文件选择
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {previewUrl ? (
        <div className="relative w-full">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
            <img
              src={previewUrl}
              alt="上传预览"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-md"
            onClick={handleDeleteImage}
          >
            <Icons.x className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-32 w-full border-dashed flex flex-col items-center justify-center"
          onClick={handleSelectFile}
        >
          <div className="flex flex-col items-center gap-1 py-2">
            <Icons.upload className="h-4 w-4 mb-1 opacity-70" />
            <span className="text-xs font-medium">点击上传图片</span>
            <span className="text-xs text-muted-foreground text-center">
              支持 JPG、PNG 格式
              <br />
              最�?2MB
            </span>
          </div>
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
} 
