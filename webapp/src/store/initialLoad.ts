// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createAsyncThunk, createSelector} from '@reduxjs/toolkit'

import {default as client} from '../octoClient'
import {Subscription} from '../wsclient'
import {ErrorId} from '../errors'
import {UserSettings} from '../userSettings'
import {Board} from '../blocks/board'

import {RootState} from './index'

function setActiveTeam(teamID: string): void {
    client.teamId = teamID
    localStorage.setItem('focalboardTeamId', teamID)
    UserSettings.setLastTeamID(teamID)
}

function clearActiveTeam(): void {
    localStorage.removeItem('focalboardTeamId')
    UserSettings.setLastTeamID(null)
}

export const initialLoad = createAsyncThunk(
    'initialLoad',
    async () => {
        const [me, myConfig, requestedTeam, teams, boardsMemberships, limits] = await Promise.all([
            client.getMe(),
            client.getMyConfig(),
            client.getTeam(),
            client.getTeams(),
            client.getMyBoardMemberships(),
            client.getBoardsCloudLimits(),
        ])

        // if no me, normally user not logged in
        if (!me) {
            throw new Error(ErrorId.NotLoggedIn)
        }

        let team = requestedTeam
        let boards: Board[] | null = null
        if (!team && teams.length > 0) {
            const candidateTeams = await Promise.all(teams.map(async (candidateTeam) => ({
                boards: await client.getBoards(candidateTeam.id),
                team: candidateTeam,
            })))
            const teamWithBoards = candidateTeams.find((candidateTeam) => candidateTeam.boards.length > 0)
            team = teamWithBoards?.team || teams[0]
            boards = teamWithBoards?.boards || null
        }

        // if no team, either bad id, or user doesn't have access
        if (!team) {
            clearActiveTeam()
            throw new Error(ErrorId.TeamUndefined)
        }

        setActiveTeam(team.id)

        const [loadedBoards, boardTemplates] = await Promise.all([
            boards || client.getBoards(team.id),
            client.getTeamTemplates(team.id),
        ])

        return {
            team,
            teams,
            boards: loadedBoards,
            boardsMemberships,
            boardTemplates,
            limits,
            myConfig,
        }
    },
)

export const initialReadOnlyLoad = createAsyncThunk(
    'initialReadOnlyLoad',
    async (boardId: string) => {
        const [board, blocks] = await Promise.all([
            client.getBoard(boardId),
            client.getAllBlocks(boardId),
        ])

        // if no board, read_token invalid
        if (!board) {
            throw new Error(ErrorId.InvalidReadOnlyBoard)
        }

        return {board, blocks}
    },
)

export const loadBoardData = createAsyncThunk(
    'loadBoardData',
    async (boardID: string) => {
        const blocks = await client.getAllBlocks(boardID)
        return {
            blocks,
        }
    },
)

export const loadBoards = createAsyncThunk(
    'loadBoards',
    async () => {
        const boards = await client.getBoards()
        return {
            boards,
        }
    },
)

export const loadMyBoardsMemberships = createAsyncThunk(
    'loadMyBoardsMemberships',
    async () => {
        const boardsMemberships = await client.getMyBoardMemberships()
        return {
            boardsMemberships,
        }
    },
)

export const getUserBlockSubscriptions = (state: RootState): Subscription[] => state.users.blockSubscriptions

export const getUserBlockSubscriptionList = createSelector(
    getUserBlockSubscriptions,
    (subscriptions) => subscriptions,
)
