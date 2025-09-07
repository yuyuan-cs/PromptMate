import * as LucideIcons from 'lucide-react';
import React from 'react'; // Import React for React.FC and SVGProps

export const aiIcons = [
  // Core AI & Prompting
  "MessageSquareText", "MessageSquareCode", "MessageSquarePlus", "MessageSquare", "MessageCircle",
  "Brain", "BrainCircuit", "Bot", "Robot", "Cpu", 
  "Lightbulb", "Sparkles", "Wand2", "Feather", "Palette",
  "Terminal", "Code", "Code2", "Command", 
  "Search", "SearchCode", "FileSearch", "Filter", // Added Filter
  
  // Content & Creation
  "FileText", "FileCode", "FileJson", 
  "Pencil", "Edit3", "Type", // Added Pencil, Edit3, Type (if not already there)
  "Mic", "Image", "PlayCircle", // Added Mic, Image, PlayCircle (for execution/generation)
  
  // Organization & Structure
  "Folder", "FolderOpen", "FolderPlus", "FolderCog", "Archive", // Added Folder variants and Archive
  "Book", "BookOpen", "BookMarked", "BookText",
  "Tags", "Tag", "Bookmark", // Added Tags, Tag, Bookmark
  "ClipboardList", "ClipboardCheck", "List", "CheckSquare", // Added list/task related

  // Broader Tech & Utility
  "Keyboard", "Laptop", "Monitor", "Database", "Cloud", 
  "CloudCog", "CloudDownload", "CloudUpload", 
  "Settings", "Settings2", "Cog", // Added Settings2, Cog
  "Zap", "Star", "Gift", // Gift can be for templates
  "Target", "Puzzle", "FlaskConical", "TestTube2", // Added for goals, problems, experiments
  "Link", "Share2", "ExternalLink" // Added for sharing/linking prompts
  // Removed some less specific ones like: "BookUser", "BookKey", "BookLock", "BookCheck", "BookX", 
  // "BookPlus", "BookMinus", "BookOpenText", "BookOpenCheck", "BookOpenCode", "BookOpenUser", "BookOpenKey", "BookOpenLock", 
  // "BookOpenX", "BookOpenPlus", "BookOpenMinus", "Network", "Server", "FileSpreadsheet", "LightbulbOff", "ZapOff", "StarHalf"
] as const;

// Helper type for icon names
export type AiIconName = typeof aiIcons[number];

// Icon name mapping for common cases
const iconNameMap: Record<string, string> = {
  // Common category icons used in the app
  'layout': 'Layout',
  'palette': 'Palette', 
  'fileText': 'FileText',
  'file': 'File',
  'fileUp': 'FileUp',
  'settings': 'Settings',
  'folder': 'FolderOpen',
  'edit': 'Edit3',
  // Add more mappings as needed
};

// Helper to get icon component by name, can be used by both components
export const getIconComponent = (iconName: string | undefined | null): React.FC<React.SVGProps<SVGSVGElement>> => {
  if (!iconName) return LucideIcons.Folder; 
  
  // First try direct lookup
  let ResolvedIconComponent = (LucideIcons as any)[iconName];
  
  // Try mapped name
  if (!ResolvedIconComponent && iconNameMap[iconName]) {
    ResolvedIconComponent = (LucideIcons as any)[iconNameMap[iconName]];
  }
  
  // Fallback for icons that might have different casing or names in Lucide
  if (!ResolvedIconComponent) {
    const capitalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    ResolvedIconComponent = (LucideIcons as any)[capitalizedIconName];
  }
  
  // Additional fallbacks for common cases
  if (!ResolvedIconComponent && iconName.toLowerCase() === 'edit') ResolvedIconComponent = LucideIcons.Edit3;
  if (!ResolvedIconComponent && iconName.toLowerCase() === 'folder') ResolvedIconComponent = LucideIcons.FolderOpen;

  // Debug logging for Electron environment to help identify missing icons
  if (!ResolvedIconComponent && typeof window !== 'undefined' && window.process?.type === 'renderer') {
    console.warn(`图标未找到: ${iconName}, 使用默认图标 HelpCircle`);
  }

  return ResolvedIconComponent || LucideIcons.HelpCircle; // Default to HelpCircle if truly not found
}; 