// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react'
import {
    Flame, Zap, Minus, CheckCircle, XCircle, Circle, Clock,
    Play, AlertCircle, Archive, Package, Trophy, Target,
    Bug, FileText, Bookmark, Flag, Mountain, Construction,
    TestTube, Hammer, MessageSquare, Phone, Calendar,
    Lightbulb, PartyPopper, ThumbsUp, Ban, CheckSquare,
} from 'lucide-react'

import {Constants} from '../constants'

import './label.scss'

type Props = {
    color?: string
    title?: string
    children: React.ReactNode
    className?: string
}

// Map property values to Lucide icons
const getIconForValue = (value: string): React.ReactNode | null => {
    const lowerValue = value.toLowerCase().trim()
    
    // Priority levels
    if (lowerValue.includes('high') || lowerValue.includes('p1')) return <Flame size={14} />
    if (lowerValue.includes('medium') || lowerValue.includes('p2')) return <Zap size={14} />
    if (lowerValue.includes('low') || lowerValue.includes('p3')) return <Minus size={14} />
    
    // Status - Completion
    if (lowerValue.includes('complete') || lowerValue.includes('done')) return <CheckCircle size={14} />
    if (lowerValue.includes('archived')) return <Archive size={14} />
    if (lowerValue.includes('closed')) return <Trophy size={14} />
    
    // Status - In Progress
    if (lowerValue.includes('in progress') || lowerValue.includes('active')) return <Play size={14} />
    if (lowerValue.includes('blocked')) return <XCircle size={14} />
    if (lowerValue.includes('not started') || lowerValue.includes('to do') || lowerValue.includes('todo')) return <Circle size={14} />
    if (lowerValue.includes('backlog')) return <Bookmark size={14} />
    
    // Types
    if (lowerValue.includes('bug')) return <Bug size={14} />
    if (lowerValue.includes('epic')) return <Mountain size={14} />
    if (lowerValue.includes('feature')) return <Construction size={14} />
    if (lowerValue.includes('task')) return <CheckSquare size={14} />
    if (lowerValue.includes('user story') || lowerValue.includes('story')) return <FileText size={14} />
    
    // Communication
    if (lowerValue.includes('discuss') || lowerValue.includes('to discuss')) return <MessageSquare size={14} />
    if (lowerValue.includes('contacted') || lowerValue.includes('contact')) return <Phone size={14} />
    if (lowerValue.includes('scheduled')) return <Calendar size={14} />
    if (lowerValue.includes('cancelled')) return <Ban size={14} />
    
    // Misc
    if (lowerValue.includes('idea')) return <Lightbulb size={14} />
    if (lowerValue.includes('published')) return <PartyPopper size={14} />
    if (lowerValue.includes('went well')) return <ThumbsUp size={14} />
    if (lowerValue.includes("didn't go well")) return <XCircle size={14} />
    if (lowerValue.includes('action item')) return <Flag size={14} />
    
    return null
}

// Switch is an on-off style switch / checkbox
function Label(props: Props): JSX.Element {
    let color = 'empty'
    if (props.color && props.color in Constants.menuColors) {
        color = props.color
    }
    
    // Extract text value from children if it's a span with Label-text class
    let textValue = ''
    if (React.isValidElement(props.children) && props.children.props.className === 'Label-text') {
        textValue = props.children.props.children
    }
    
    const icon = textValue ? getIconForValue(textValue) : null
    
    return (
        <span
            className={`Label ${color} ${props.className ? props.className : ''}`}
            title={props.title}
        >
            {icon && <span className="Label-icon" style={{marginRight: '4px', display: 'inline-flex', alignItems: 'center'}}>{icon}</span>}
            {props.children}
        </span>
    )
}

export default React.memo(Label)
