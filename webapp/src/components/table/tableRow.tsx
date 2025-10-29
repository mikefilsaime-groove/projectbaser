// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react'
import {FormattedMessage, useIntl} from 'react-intl'
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
    // Additional icons from emoji mapping
    Hand, Move, CheckCircle2, AlertTriangle, Flame, Sparkles, CalendarDays,
    CalendarCheck, BarChart3, TrendingDown, Film, Sliders, Glasses,
    BookOpen, Laptop, Key, Trash2, Edit3, Banknote, PenTool, Microscope,
    Compass, Mountain, PartyPopper, Car, Inbox, Timer, Hourglass,
    FolderOpen, Rocket, Handshake, TestTube, Building, Plug, Frame, 
    CloudRainWind, Trees, Bug, Bird, Cat, Construction,
} from 'lucide-react'

import {Card} from '../../blocks/card'
import {Board, IPropertyTemplate} from '../../blocks/board'
import {Constants} from '../../constants'
import mutator from '../../mutator'
import Button from '../../widgets/buttons/button'
import Editable from '../../widgets/editable'
import {useSortable} from '../../hooks/sortable'

import {Utils} from '../../utils'

import PropertyValueElement from '../propertyValueElement'
import MenuWrapper from '../../widgets/menuWrapper'
import IconButton from '../../widgets/buttons/iconButton'
import CompassIcon from '../../widgets/icons/compassIcon'
import OptionsIcon from '../../widgets/icons/options'
import Tooltip from '../../widgets/tooltip'
import ConfirmationDialogBox, {ConfirmationDialogBoxProps} from '../confirmationDialogBox'
import TelemetryClient, {TelemetryActions, TelemetryCategory} from '../../telemetry/telemetryClient'
import CardActionsMenu from '../cardActionsMenu/cardActionsMenu'
import {convertEmojiToLucideIcon} from '../../lucideIconList'

import {useColumnResize} from './tableColumnResizeContext'

import './tableRow.scss'

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
    // Additional icons from emoji mapping
    Hand, Move, CheckCircle2, AlertTriangle, Flame, Sparkles, CalendarDays,
    CalendarCheck, BarChart3, TrendingDown, Film, Sliders, Glasses,
    BookOpen, Laptop, Key, Trash2, Edit3, Banknote, PenTool, Microscope,
    Compass, Mountain, PartyPopper, Car, Inbox, Timer, Hourglass,
    FolderOpen, Rocket, Handshake, TestTube, Building, Plug, Frame,
    CloudRainWind, Trees, Bug, Bird, Cat, Construction,
}

type Props = {
    board: Board
    columnWidths: Record<string, number>
    isManualSort: boolean
    groupById?: string
    visiblePropertyIds: string[]
    collapsedOptionIds: string[]
    card: Card
    isSelected: boolean
    focusOnMount: boolean
    isLastCard: boolean
    showCard: (cardId?: string) => void
    readonly: boolean
    addCard: (groupByOptionId?: string) => Promise<void>
    onClick?: (e: React.MouseEvent<HTMLDivElement>, card: Card) => void
    onDrop: (srcCard: Card, dstCard: Card) => void
}

const TableRow = (props: Props) => {
    const intl = useIntl()
    const {board, card, isManualSort, groupById, visiblePropertyIds, collapsedOptionIds} = props

    const titleRef = useRef<{ focus(selectAll?: boolean): void }>(null)
    const [title, setTitle] = useState(props.card.title || '')
    const isGrouped = Boolean(groupById)
    const [isDragging, isOver, cardRef] = useSortable('card', card, !props.readonly && (isManualSort || isGrouped), props.onDrop)
    const [showConfirmationDialogBox, setShowConfirmationDialogBox] = useState<boolean>(false)
    const columnResize = useColumnResize()

    useEffect(() => {
        if (props.focusOnMount) {
            setTimeout(() => titleRef.current?.focus(), 10)
        }
    }, [])

    const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        props.onClick && props.onClick(e, card)
    }, [card, props.onClick])

    const onSaveWithEnter = useCallback(() => {
        if (props.isLastCard) {
            props.addCard(groupById ? card.fields.properties[groupById!] as string : '')
        }
    }, [groupById && card.fields.properties[groupById!], props.isLastCard, props.addCard])

    const onSave = useCallback((saveType) => {
        if (card.title !== title) {
            mutator.changeBlockTitle(props.board.id, card.id, card.title, title)
            if (saveType === 'onEnter') {
                onSaveWithEnter()
            }
        }
    }, [card.title, title, onSaveWithEnter, board.id, card.id])

    const onTitleChange = useCallback((newTitle: string) => {
        setTitle(newTitle)
    }, [title, setTitle])

    const visiblePropertyTemplates = useMemo(() => (
        visiblePropertyIds.map((id) => board.cardProperties.find((t) => t.id === id)).filter((i) => i) as IPropertyTemplate[]
    ), [board.cardProperties, visiblePropertyIds])

    let className = props.isSelected ? 'TableRow octo-table-row selected' : 'TableRow octo-table-row'
    if (isOver) {
        className += ' dragover'
    }
    if (isGrouped) {
        const groupID = groupById || ''
        let groupValue = card.fields.properties[groupID] as string || 'undefined'
        if (groupValue === 'undefined') {
            const template = board.cardProperties.find((p) => p.id === groupById) //templates.find((o) => o.id === groupById)
            if (template && template.type === 'createdBy') {
                groupValue = card.createdBy
            } else if (template && template.type === 'updatedBy') {
                groupValue = card.modifiedBy
            }
        } else if (Array.isArray(groupValue)) {
            groupValue = groupValue[0]
        }
        if (collapsedOptionIds.indexOf(groupValue) > -1) {
            className += ' hidden'
        }
    }
    if (props.readonly) {
        className += ' readonly'
    }

    const handleDeleteCard = useCallback(async () => {
        if (!card) {
            Utils.assertFailure()
            return
        }
        TelemetryClient.trackEvent(TelemetryCategory, TelemetryActions.DeleteCard, {board: board.id, card: card.id})
        await mutator.deleteBlock(card, 'delete card')
    }, [card, board.id])

    const confirmDialogProps: ConfirmationDialogBoxProps = useMemo(() => {
        return {
            heading: intl.formatMessage({id: 'CardDialog.delete-confirmation-dialog-heading', defaultMessage: 'Confirm card delete!'}),
            confirmButtonText: intl.formatMessage({id: 'CardDialog.delete-confirmation-dialog-button-text', defaultMessage: 'Delete'}),
            onConfirm: handleDeleteCard,
            onClose: () => {
                setShowConfirmationDialogBox(false)
            },
        }
    }, [handleDeleteCard])

    const handleDeleteButtonOnClick = useCallback(() => {
        // user trying to delete a card with blank name
        // but content present cannot be deleted without
        // confirmation dialog
        if (card?.title === '' && card?.fields.contentOrder.length === 0) {
            handleDeleteCard()
            return
        }
        setShowConfirmationDialogBox(true)
    }, [card.title, card.fields.contentOrder, handleDeleteCard])

    return (
        <div
            className={className}
            onClick={onClick}
            ref={cardRef}
            style={{opacity: isDragging ? 0.5 : 1}}
        >

            <div className='action-cell octo-table-cell-btn'>
                {!props.readonly && (
                    <IconButton icon={<CompassIcon icon='drag-vertical'/>}/>
                )}
            </div>

            {/* Name / title */}
            <div
                className='octo-table-cell title-cell'
                id='mainBoardHeader'
                style={{width: columnResize.width(Constants.titleColumnId)}}
                ref={(ref) => columnResize.updateRef(card.id, Constants.titleColumnId, ref)}
            >
                <div className='octo-icontitle'>
                    { card.fields.icon ? (
                        <div className='octo-icon lucide-icon'>
                            {(() => {
                                const iconName = convertEmojiToLucideIcon(card.fields.icon)
                                const IconComponent = LucideIcons[iconName]
                                return IconComponent ? <IconComponent size={16} /> : <LucideIcons.Circle size={16} />
                            })()}
                        </div>
                    ) : undefined }
                    <Editable
                        ref={titleRef}
                        value={title}
                        placeholderText='Untitled'
                        onChange={onTitleChange}
                        onSave={onSave}
                        onCancel={() => setTitle(card.title || '')}
                        readonly={props.readonly}
                        spellCheck={true}
                    />
                </div>

                {!props.readonly && (
                    <MenuWrapper
                        className='optionsMenu ml-2 mr-2'
                        stopPropagationOnToggle={true}
                    >
                        <Tooltip
                            title={intl.formatMessage({id: 'TableRow.MoreOption', defaultMessage: 'More actions'})}
                        >
                            <IconButton
                                title='MenuBtn'
                                icon={<OptionsIcon/>}
                            />
                        </Tooltip>
                        <CardActionsMenu
                            cardId={card.id}
                            boardId={card.boardId}
                            onClickDelete={handleDeleteButtonOnClick}
                            onClickDuplicate={() => {
                                mutator.duplicateCard(
                                    card.id,
                                    board.id,
                                    false,
                                    intl.formatMessage({id: 'TableRow.DuplicateCard', defaultMessage: 'duplicate card'}),
                                    false,
                                    {},
                                    async (newCardId) => {
                                        props.showCard(newCardId)
                                    },
                                    async () => {
                                        props.showCard(undefined)
                                    },
                                )
                            }}
                        />
                    </MenuWrapper>
                )}

                <div className='open-button'>
                    <Button onClick={() => props.showCard(props.card.id || '')}>
                        <FormattedMessage
                            id='TableRow.open'
                            defaultMessage='Open'
                        />
                    </Button>
                </div>
            </div>

            {/* Columns, one per property */}
            {visiblePropertyTemplates.map((template) => {
                return (
                    <div
                        className='octo-table-cell'
                        key={template.id}
                        style={{width: columnResize.width(template.id)}}
                        ref={(ref) => columnResize.updateRef(card.id, template.id, ref)}
                    >
                        <PropertyValueElement
                            readOnly={props.readonly}
                            card={card}
                            board={board}
                            propertyTemplate={template}
                            showEmptyPlaceholder={false}
                        />
                    </div>
                )
            })}

            {showConfirmationDialogBox && <ConfirmationDialogBox dialogBox={confirmDialogProps}/>}
        </div>
    )
}

export default React.memo(TableRow)
