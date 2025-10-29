// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback} from 'react'
import * as LucideIcons from 'lucide-react'

import {BlockIcons} from '../blockIcons'
import {Card} from '../blocks/card'
import mutator from '../mutator'
import {convertEmojiToLucideIcon} from '../lucideIconList'

import IconSelector from './iconSelector'

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

    // Try to convert emoji to Lucide icon, or use icon name directly
    let iconName = block.fields.icon
    const convertedIcon = convertEmojiToLucideIcon(iconName)
    if (convertedIcon !== 'Circle' || iconName.length <= 2) {
        // Either found in mapping or likely an emoji (short string)
        iconName = convertedIcon
    }

    // Get the Lucide icon component
    const IconComponent = (LucideIcons as any)[iconName]
    const sizeMap = {s: 16, m: 20, l: 24}
    const iconSize = sizeMap[size || 'm']

    const iconElement = (
        <div className={className}>
            {IconComponent ? <IconComponent size={iconSize} /> : <span>{block.fields.icon}</span>}
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
