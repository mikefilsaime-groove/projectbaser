// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback} from 'react'
import {
    Circle, CheckSquare, Calendar, Clock, FileText, Image, Link, Tag, User, Users,
    Folder, File, Archive, Bookmark, Bell, Flag, Star, Heart, Target, TrendingUp,
    BarChart, PieChart, Activity, Briefcase, ShoppingCart, DollarSign, CreditCard,
    MapPin, Globe, Mail, Phone, MessageSquare, Send, Paperclip, Download, Upload,
    Settings, Wrench, Search, Filter, Eye, Lock, Unlock, Shield, AlertCircle,
    CheckCircle, XCircle, Info, HelpCircle, Home, Menu, ChevronRight, ChevronDown,
    Plus, Minus, X, Check, Edit, Trash, Copy, Clipboard, Share, ExternalLink,
    Zap, Code, Terminal, Box, Package, Layers, Grid, List, LayoutGrid, Columns,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline,
    Hash, AtSign, Percent, Smile, ThumbsUp, Award, Gift, Trophy, Lightbulb,
    Book, GraduationCap, Palette, Music, Video, Camera, Mic, Speaker,
    Wifi, Bluetooth, Battery, Cpu, HardDrive, Monitor, Printer, Smartphone,
    Tablet, Watch, Play, Pause, StopCircle, SkipForward, SkipBack,
    Volume, VolumeX, Sun, Moon, Cloud, CloudRain, Wind, Thermometer,
    Banknote, PenTool, Microscope, Compass, Mountain, PartyPopper, Car,
    Inbox, Timer, Hourglass, FolderOpen, Rocket,
    Handshake, TestTube, Building, Plug, Frame, CloudRainWind, Trees,
    Bug, Bird, Cat, Construction,
} from 'lucide-react'

import {BlockIcons} from '../blockIcons'
import {Card} from '../blocks/card'
import mutator from '../mutator'
import {convertEmojiToLucideIcon} from '../lucideIconList'

import IconSelector from './iconSelector'

const LucideIcons: Record<string, any> = {
    Circle, CheckSquare, Calendar, Clock, FileText, Image, Link, Tag, User, Users,
    Folder, File, Archive, Bookmark, Bell, Flag, Star, Heart, Target, TrendingUp,
    BarChart, PieChart, Activity, Briefcase, ShoppingCart, DollarSign, CreditCard,
    MapPin, Globe, Mail, Phone, MessageSquare, Send, Paperclip, Download, Upload,
    Settings, Wrench, Search, Filter, Eye, Lock, Unlock, Shield, AlertCircle,
    CheckCircle, XCircle, Info, HelpCircle, Home, Menu, ChevronRight, ChevronDown,
    Plus, Minus, X, Check, Edit, Trash, Copy, Clipboard, Share, ExternalLink,
    Zap, Code, Terminal, Box, Package, Layers, Grid, List, LayoutGrid, Columns,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline,
    Hash, AtSign, Percent, Smile, ThumbsUp, Award, Gift, Trophy, Lightbulb,
    Book, GraduationCap, Palette, Music, Video, Camera, Mic, Speaker,
    Wifi, Bluetooth, Battery, Cpu, HardDrive, Monitor, Printer, Smartphone,
    Tablet, Watch, Play, Pause, StopCircle, SkipForward, SkipBack,
    Volume, VolumeX, Sun, Moon, Cloud, CloudRain, Wind, Thermometer,
    Banknote, PenTool, Microscope, Compass, Mountain, PartyPopper, Car,
    Inbox, Timer, Hourglass, FolderOpen, Rocket,
    Handshake, TestTube, Building, Plug, Frame, CloudRainWind, Trees,
    Bug, Bird, Cat, Construction,
}

type Props = {
    block: Card
    size?: 's' | 'm' | 'l'
    readonly?: boolean
}

const BlockIconSelector = (props: Props) => {
    const {block, size} = props

    const onSelectEmoji = useCallback((iconName: string) => {
        mutator.changeBlockIcon(block.boardId, block.id, block.fields.icon, iconName)
        document.body.click()
    }, [block.id, block.fields.icon])
    const onAddRandomIcon = useCallback(() => mutator.changeBlockIcon(block.boardId, block.id, block.fields.icon, BlockIcons.shared.randomIcon()), [block.id, block.fields.icon])
    const onRemoveIcon = useCallback(() => mutator.changeBlockIcon(block.boardId, block.id, block.fields.icon, '', 'remove icon'), [block.id, block.fields.icon])

    if (!block.fields.icon) {
        return null
    }

    let className = `octo-icon lucide-icon size-${size || 'm'}`
    if (props.readonly) {
        className += ' readonly'
    }

    // Convert emoji to Lucide icon
    const iconName = convertEmojiToLucideIcon(block.fields.icon)
    const IconComponent = (LucideIcons as any)[iconName]
    const sizeMap = {s: 16, m: 20, l: 24}
    const iconSize = sizeMap[size || 'm']

    const iconElement = (
        <div className={className}>
            {IconComponent ? <IconComponent size={iconSize} /> : <LucideIcons.Circle size={iconSize} />}
        </div>
    )

    return (
        <IconSelector
            readonly={props.readonly}
            iconElement={iconElement}
            onAddRandomIcon={onAddRandomIcon}
            onSelectEmoji={onSelectEmoji}
            onRemoveIcon={onRemoveIcon}
        />
    )
}

export default React.memo(BlockIconSelector)
