// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Client-side helpers for the Scale Plus Pro Max Team Workspaces adapter.
// The feature is DISABLED BY DEFAULT: the server only reports it enabled via
// /api/v2/clientConfig when SCALE_TEAM_WORKSPACES_ENABLED=true. Everything
// here is presentation/transport plumbing; authorization always happens
// server-side against the central hub.

const CODE_PARAM = 'scale_workspace_code'

// Set from the server-delivered client config; never persisted.
let featureEnabled = false

export const setScaleWorkspaceFeatureEnabled = (enabled: boolean): void => {
    featureEnabled = enabled
}

export const isScaleWorkspaceFeatureEnabled = (): boolean => featureEnabled

// The single-use launch code only ever lives in the URL while it travels
// through the sign-in flow. It must never be written to storage or logs.
export const getPendingScaleWorkspaceCode = (): string => {
    try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get(CODE_PARAM) || ''
        return code.length > 0 && code.length <= 256 ? code : ''
    } catch {
        return ''
    }
}

export const removeScaleWorkspaceCodeFromUrl = (): void => {
    try {
        const url = new URL(window.location.href)
        if (url.searchParams.has(CODE_PARAM)) {
            url.searchParams.delete(CODE_PARAM)
            window.history.replaceState({}, document.title, url.pathname + url.search + url.hash)
        }
    } catch {
        // best effort only
    }
}

export type ScaleWorkspaceDisplayContext = {
    workspaceType: 'personal' | 'guest'
    workspaceName: string
    workspaceOwnerName?: string
    workspaceOwnerEmail?: string
    workspaceSwitchUrl?: string
    allowedApplications?: string[]
    teamId?: string
}

export type ScaleWorkspaceExchangeResult = {
    teamId: string
    returnPath: string
}
