// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback} from 'react'
import * as LucideIcons from 'lucide-react'

import {BlockIcons} from '../blockIcons'
import {Board} from '../blocks/board'
import mutator from '../mutator'
import {convertEmojiToLucideIcon} from '../lucideIconList'

import IconSelector from './iconSelector'

type Props = {
    board: Board
    size?: 's' | 'm' | 'l'
    readonly?: boolean
}

const BoardIconSelector = React.memo((props: Props) => {
    const {board, size} = props

    const onSelectEmoji = useCallback((iconName: string) => {
        mutator.changeBoardIcon(board.id, board.icon, iconName)
        document.body.click()
    }, [board.id, board.icon])
    const onAddRandomIcon = useCallback(() => mutator.changeBoardIcon(board.id, board.icon, BlockIcons.shared.randomIcon()), [board.id, board.icon])
    const onRemoveIcon = useCallback(() => mutator.changeBoardIcon(board.id, board.icon, '', 'remove board icon'), [board.id, board.icon])

    if (!board.icon) {
        return null
    }

    let className = `octo-icon lucide-icon size-${size || 'm'}`
    if (props.readonly) {
        className += ' readonly'
    }

    // Convert emoji to Lucide icon
    const iconName = convertEmojiToLucideIcon(board.icon)
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
})

export default BoardIconSelector
