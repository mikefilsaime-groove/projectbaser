// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Board} from '../../blocks/board'
import {CategoryBoards} from '../../store/sidebar'

import {getFirstAvailableBoardID} from './teamToBoardAndViewRedirect'

describe('getFirstAvailableBoardID', () => {
    const visibleBoard = {id: 'visible-board'} as Board
    const hiddenBoard = {id: 'hidden-board'} as Board
    const missingBoard = {id: 'missing-board'} as Board

    const categories = [
        {
            id: 'category-1',
            boardMetadata: [
                {boardID: hiddenBoard.id, hidden: true},
                {boardID: missingBoard.id, hidden: false},
            ],
        },
        {
            id: 'category-2',
            boardMetadata: [
                {boardID: visibleBoard.id, hidden: false},
            ],
        },
    ] as CategoryBoards[]

    it('returns the first visible board that exists in the loaded board map', () => {
        expect(getFirstAvailableBoardID(categories, {
            [hiddenBoard.id]: hiddenBoard,
            [visibleBoard.id]: visibleBoard,
        })).toBe(visibleBoard.id)
    })

    it('returns null when every category board is hidden or unavailable', () => {
        expect(getFirstAvailableBoardID(categories, {
            [hiddenBoard.id]: hiddenBoard,
        })).toBeNull()
    })
})
