// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Lucide icon names for ProjectBaser - Modern professional icons
// These replace the emoji system with clean, consistent Lucide icons

// Full list of available Lucide icons for selection
const lucideIconList = [
    // Work & Productivity
    'CheckSquare', 'CheckCircle2', 'Circle', 'Square', 'Target', 'Flag', 'Star', 'Heart',
    'Bookmark', 'Award', 'Trophy', 'Medal', 'Briefcase', 'Lightbulb', 'Zap', 'TrendingUp',
    
    // Organization & Planning
    'Calendar', 'Clock', 'Timer', 'AlarmClock', 'CalendarDays', 'CalendarCheck', 'CalendarClock',
    'List', 'ListChecks', 'ListTodo', 'LayoutGrid', 'LayoutList', 'Columns',
    
    // Communication & Collaboration
    'MessageSquare', 'MessageCircle', 'Mail', 'Send', 'Users', 'User', 'UserPlus', 'UserCheck',
    'Bell', 'BellRing', 'Share2', 'AtSign', 'Hash', 'Link', 'ExternalLink',
    
    // Files & Documents
    'File', 'FileText', 'FileCheck', 'Folder', 'FolderOpen', 'FolderPlus', 'Archive',
    'Clipboard', 'ClipboardCheck', 'ClipboardList', 'Paperclip', 'Download', 'Upload',
    
    // Tools & Actions
    'Settings', 'Sliders', 'Filter', 'Search', 'Plus', 'Minus', 'Edit', 'Edit3',
    'Trash2', 'Copy', 'Scissors', 'MoreHorizontal', 'MoreVertical', 'Move', 'ArrowRight',
    
    // Status & Progress
    'CheckCircle', 'XCircle', 'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle',
    'Loader', 'RefreshCw', 'RotateCw', 'Repeat', 'PlayCircle', 'PauseCircle', 'StopCircle',
    
    // Categories & Tags
    'Tag', 'Tags', 'Bookmark', 'Layers', 'Package', 'Box', 'Grid', 'Layout',
    
    // Technology & Development
    'Code', 'Terminal', 'Cpu', 'Database', 'Server', 'Globe', 'Wifi', 'Smartphone',
    'Laptop', 'Monitor', 'Tablet', 'Cloud', 'CloudUpload', 'CloudDownload', 'Lock', 'Unlock',
    
    // Business & Finance
    'DollarSign', 'CreditCard', 'ShoppingCart', 'ShoppingBag', 'BarChart', 'BarChart2', 'BarChart3',
    'LineChart', 'PieChart', 'TrendingDown', 'Activity', 'Percent',
    
    // Creative & Media
    'Image', 'Camera', 'Video', 'Film', 'Music', 'Mic', 'Headphones', 'Palette',
    'Brush', 'Pen', 'PenTool', 'Type', 'Eye', 'EyeOff',
    
    // Navigation & Movement
    'Home', 'Compass', 'Map', 'MapPin', 'Navigation', 'Crosshair', 'Maximize', 'Minimize',
    'ZoomIn', 'ZoomOut', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown',
    
    // Nature & Objects
    'Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow', 'Umbrella', 'Coffee', 'Gift',
    'Rocket', 'Sparkles', 'Flame', 'Droplet', 'Wind', 'Mountain',
    
    // Social & Sharing
    'ThumbsUp', 'ThumbsDown', 'Smile', 'Frown', 'Meh', 'Heart', 'HeartHandshake',
]

// Random icon selection list (subset) - for new boards/cards
const randomLucideIconList = [
    'CheckSquare', 'Target', 'Flag', 'Star', 'Lightbulb', 'Zap', 'TrendingUp',
    'Calendar', 'Clock', 'ListChecks', 'LayoutGrid',
    'MessageSquare', 'Users', 'Bell', 'Share2', 'Link',
    'FileText', 'Folder', 'Clipboard', 'ClipboardCheck',
    'Settings', 'Filter', 'Edit3', 'Plus',
    'CheckCircle', 'AlertCircle', 'Info', 'RefreshCw',
    'Tag', 'Layers', 'Package', 'Grid',
    'Code', 'Database', 'Globe', 'Lock',
    'BarChart3', 'LineChart', 'Activity',
    'Image', 'Palette', 'Pen', 'Rocket', 'Sparkles',
]

// Emoji to Lucide icon mapping for backward compatibility
const emojiToLucideMap: {[key: string]: string} = {
    // Welcome board emojis
    '👋': 'Hand',
    '🤏': 'Move',
    '☑️': 'CheckSquare',
    '📋': 'Clipboard',
    '📤': 'Send',
    '📮': 'Mail',
    '📝': 'FileText',
    '🎛️': 'Sliders',
    '👓': 'Glasses',
    '🏷️': 'Tag',
    '🔔': 'Bell',
    
    // Common task/status emojis
    '✅': 'CheckCircle2',
    '❌': 'XCircle',
    '⚠️': 'AlertTriangle',
    'ℹ️': 'Info',
    '❓': 'HelpCircle',
    '⏰': 'Clock',
    '📅': 'Calendar',
    '📆': 'CalendarDays',
    '🔥': 'Flame',
    '🎯': 'Target',
    '💡': 'Lightbulb',
    '⚡': 'Zap',
    '🚀': 'Rocket',
    '✨': 'Sparkles',
    '🙌': 'Sparkles',
    
    // Template emojis (Meeting Agenda, Sales Pipeline, etc.)
    '🗓️': 'CalendarCheck',
    '💼': 'Briefcase',
    '📊': 'BarChart3',
    '📈': 'TrendingUp',
    '📉': 'TrendingDown',
    '🎨': 'Palette',
    '🎬': 'Film',
    '🏆': 'Trophy',
    '🎖️': 'Award',
    '⭐': 'Star',
    '💪': 'Zap',
    '🎓': 'GraduationCap',
    '📚': 'BookOpen',
    '📱': 'Smartphone',
    '💻': 'Laptop',
    '🖥️': 'Monitor',
    '🌐': 'Globe',
    '🔒': 'Lock',
    '🔓': 'Unlock',
    '🔑': 'Key',
    '💰': 'DollarSign',
    '💳': 'CreditCard',
    '🛒': 'ShoppingCart',
    '🎁': 'Gift',
    
    // Common symbols
    '➕': 'Plus',
    '➖': 'Minus',
    '✏️': 'Edit',
    '🗑️': 'Trash2',
    '📎': 'Paperclip',
    '🔍': 'Search',
    '🔗': 'Link',
    '🏠': 'Home',
    '⚙️': 'Settings',
}

function convertEmojiToLucideIcon(emoji: string): string {
    return emojiToLucideMap[emoji] || 'Circle'
}

export {lucideIconList, randomLucideIconList, emojiToLucideMap, convertEmojiToLucideIcon}
