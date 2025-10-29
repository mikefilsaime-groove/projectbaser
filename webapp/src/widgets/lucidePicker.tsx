// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC, useState} from 'react'
import * as LucideIcons from 'lucide-react'

import {lucideIconList} from '../lucideIconList'
import './lucidePicker.scss'

type Props = {
    onSelect: (iconName: string) => void
}

const LucidePicker: FC<Props> = (props: Props): JSX.Element => {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredIcons = lucideIconList.filter(iconName =>
        iconName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleIconClick = (iconName: string) => {
        props.onSelect(iconName)
    }

    return (
        <div
            className='LucidePicker'
            onClick={(e) => e.stopPropagation()}
        >
            <div className='lucide-picker-search'>
                <input
                    type='text'
                    placeholder='Search icons...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus={true}
                />
            </div>
            <div className='lucide-picker-grid'>
                {filteredIcons.map((iconName) => {
                    const IconComponent = (LucideIcons as any)[iconName]
                    if (!IconComponent) return null
                    
                    return (
                        <button
                            key={iconName}
                            className='lucide-picker-icon'
                            onClick={() => handleIconClick(iconName)}
                            title={iconName}
                        >
                            <IconComponent size={20} />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default LucidePicker
