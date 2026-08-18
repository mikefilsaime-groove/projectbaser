// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react'

import client from '../../octoClient'
import {ScaleWorkspaceDisplayContext, isScaleWorkspaceFeatureEnabled} from '../../scaleWorkspace'

import './scalePlusAppLauncher.scss'

const SCRIPT_ID = 'scaleplus-app-launcher-script'
const SCRIPT_URL = 'https://app.scaleplus.gg/app-launcher.js'
const ANCHOR_SELECTOR = '[data-scaleplus-launcher-anchor="projectbaser-sidebar"]'
const OPEN_MODAL_SELECTOR = '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], dialog[open], [aria-modal="true"]'

type LauncherInstance = { destroy: () => void }
type LauncherApi = {
    mount: (options: {
        currentApp: string
        anchor: string
        anchorGap: number
        anchorAlign: 'start'
        navigation: 'direct'
        target: '_self'

        // Sanitized, display-only Scale Plus team-workspace fields.
        // Never used for authorization.
        workspaceType?: 'personal' | 'guest'
        workspaceName?: string
        workspaceOwnerName?: string
        workspaceOwnerEmail?: string
        workspaceSwitchUrl?: string
        allowedApps?: string[]
    }) => LauncherInstance
}

declare global {
    interface Window {
        ScalePlusAppLauncher?: LauncherApi
    }
}

const ScalePlusAppLauncher = (): JSX.Element => {
    useEffect(() => {
        let launcher: LauncherInstance | undefined
        let workspaceContext: ScaleWorkspaceDisplayContext | null = null
        let disposed = false

        const canMount = () => window.matchMedia('(min-width: 1024px)').matches && !document.querySelector(OPEN_MODAL_SELECTOR)
        const destroy = () => {
            launcher?.destroy()
            launcher = undefined
        }
        const mount = () => {
            if (!canMount() || launcher || !window.ScalePlusAppLauncher) {
                return
            }
            const guest = workspaceContext && workspaceContext.workspaceType === 'guest' ? workspaceContext : null
            launcher = window.ScalePlusAppLauncher.mount({
                currentApp: 'projectbaser',
                anchor: ANCHOR_SELECTOR,
                anchorGap: 0,
                anchorAlign: 'start',
                navigation: 'direct',
                target: '_self',
                ...(guest ? {
                    workspaceType: 'guest' as const,
                    workspaceName: guest.workspaceName,
                    workspaceOwnerName: guest.workspaceOwnerName,
                    workspaceOwnerEmail: guest.workspaceOwnerEmail,
                    workspaceSwitchUrl: guest.workspaceSwitchUrl,
                    allowedApps: guest.allowedApplications,
                } : {}),
            })
        }
        const refresh = () => {
            if (canMount()) {
                mount()
            } else {
                destroy()
            }
        }

        // Display-only: when the team-workspace adapter is enabled, show the
        // active guest workspace in the launcher. No-op while the feature
        // flag is off.
        if (isScaleWorkspaceFeatureEnabled()) {
            client.getScaleWorkspaceDisplayContext().then((context) => {
                if (disposed || !context || context.workspaceType !== 'guest') {
                    return
                }
                workspaceContext = context
                destroy()
                refresh()
            }).catch(() => undefined)
        }

        const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
        if (script) {
            if (window.ScalePlusAppLauncher) {
                mount()
            } else {
                script.addEventListener('load', mount, {once: true})
            }
        } else {
            const launcherScript = document.createElement('script')
            launcherScript.id = SCRIPT_ID
            launcherScript.src = SCRIPT_URL
            launcherScript.async = true
            launcherScript.dataset.autoMount = 'false'
            launcherScript.addEventListener('load', mount, {once: true})
            document.head.appendChild(launcherScript)
        }

        const observer = new MutationObserver(refresh)
        observer.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['aria-modal', 'data-state', 'open', 'role'],
        })
        const mediaQuery = window.matchMedia('(min-width: 1024px)')
        mediaQuery.addEventListener('change', refresh)

        return () => {
            disposed = true
            observer.disconnect()
            mediaQuery.removeEventListener('change', refresh)
            destroy()
        }
    }, [])

    return (
        <div className='ScalePlusAppLauncher'>
            <div data-scaleplus-launcher-anchor='projectbaser-sidebar'/>
        </div>
    )
}

export default React.memo(ScalePlusAppLauncher)
