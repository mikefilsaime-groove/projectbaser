// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {randomLucideIconList} from './lucideIconList'

class BlockIcons {
    static readonly shared = new BlockIcons()

    randomIcon(): string {
        const index = Math.floor(Math.random() * randomLucideIconList.length)
        const icon = randomLucideIconList[index]
        return icon
    }
}

export {BlockIcons}
