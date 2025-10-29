// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CSSObject} from '@emotion/serialize'
import isEqual from 'lodash/isEqual'
import color from 'color'

let activeThemeName: string

import {UserSettings} from './userSettings'

export type Theme = {
    mainBg: string
    mainFg: string
    buttonBg: string
    buttonFg: string
    sidebarBg: string
    sidebarFg: string
    sidebarTextActiveBorder: string
    sidebarWhiteLogo: string

    link: string
    linkVisited: string

    propDefault: string
    propGray: string
    propBrown: string
    propOrange: string
    propYellow: string
    propGreen: string
    propBlue: string
    propPurple: string
    propPink: string
    propRed: string
}

export const systemThemeName = 'system-theme'

export const defaultThemeName = 'default-theme'

export const defaultTheme = {
    mainBg: '255, 255, 255',
    mainFg: '9, 9, 11',
    buttonBg: '124, 58, 237',
    buttonFg: '247, 250, 252',
    sidebarBg: '255, 255, 255',
    sidebarFg: '9, 9, 11',
    sidebarTextActiveBorder: '124, 58, 237',
    sidebarWhiteLogo: 'false',

    link: '124, 58, 237',
    linkVisited: '#7c3aed',

    propDefault: '#fff',
    propGray: '#f4f4f5',
    propBrown: '#fef3c7',
    propOrange: '#fed7aa',
    propYellow: '#fef08a',
    propGreen: '#d9f99d',
    propBlue: '#bfdbfe',
    propPurple: '#e9d5ff',
    propPink: '#fbcfe8',
    propRed: '#fecaca',
}

export const darkThemeName = 'dark-theme'

export const darkTheme = {
    ...defaultTheme,

    mainBg: '24, 24, 27',
    mainFg: '250, 250, 250',
    buttonBg: '59, 130, 246',
    buttonFg: '255, 255, 255',
    sidebarBg: '9, 9, 11',
    sidebarFg: '250, 250, 250',
    sidebarTextActiveBorder: '59, 130, 246',
    sidebarWhiteLogo: 'true',

    link: '59, 130, 246',
    linkVisited: 'hsla(270, 68%, 70%, 1.0)',

    propDefault: 'hsla(0, 0%, 100%, 0.08)',
    propGray: 'hsla(0, 0%, 96%, 0.4)',
    propBrown: 'hsla(39, 77%, 88%, 0.4)',
    propOrange: 'hsla(24, 98%, 81%, 0.4)',
    propYellow: 'hsla(55, 97%, 77%, 0.4)',
    propGreen: 'hsla(84, 89%, 79%, 0.4)',
    propBlue: 'hsla(214, 95%, 86%, 0.4)',
    propPurple: 'hsla(270, 100%, 90%, 0.4)',
    propPink: 'hsla(326, 78%, 90%, 0.4)',
    propRed: 'hsla(0, 93%, 87%, 0.4)',
}

export const lightThemeName = 'light-theme'

export const lightTheme = {
    ...defaultTheme,

    mainBg: '255, 255, 255',
    mainFg: '9, 9, 11',
    buttonBg: '124, 58, 237',
    buttonFg: '247, 250, 252',
    sidebarBg: '255, 255, 255',
    sidebarFg: '9, 9, 11',
    sidebarTextActiveBorder: '124, 58, 237',
    sidebarWhiteLogo: 'false',
}

export function setTheme(theme: Theme | null): Theme {
    let consolidatedTheme = defaultTheme
    if (theme) {
        consolidatedTheme = {...defaultTheme, ...theme}
        UserSettings.theme = JSON.stringify(consolidatedTheme)
    } else {
        UserSettings.theme = ''
        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
        if (darkThemeMq.matches) {
            consolidatedTheme = {...defaultTheme, ...darkTheme}
        }
    }

    setActiveThemeName(consolidatedTheme, theme)

    // for personal server and desktop, Focalboard is responsible for managing the theme,
    // so we set all the color variables here.
    document.documentElement.style.setProperty('--center-channel-bg-rgb', consolidatedTheme.mainBg)
    document.documentElement.style.setProperty('--center-channel-color-rgb', consolidatedTheme.mainFg)
    document.documentElement.style.setProperty('--button-bg-rgb', consolidatedTheme.buttonBg)
    document.documentElement.style.setProperty('--button-color-rgb', consolidatedTheme.buttonFg)
    document.documentElement.style.setProperty('--sidebar-bg-rgb', consolidatedTheme.sidebarBg)
    document.documentElement.style.setProperty('--sidebar-text-rgb', consolidatedTheme.sidebarFg)
    document.documentElement.style.setProperty('--link-color-rgb', consolidatedTheme.link)
    document.documentElement.style.setProperty('--sidebar-text-active-border-rgb', consolidatedTheme.sidebarTextActiveBorder)

    document.documentElement.style.setProperty('--sidebar-white-logo', consolidatedTheme.sidebarWhiteLogo)
    document.documentElement.style.setProperty('--link-visited-color-rgb', consolidatedTheme.linkVisited)

    document.documentElement.style.setProperty('--prop-default', consolidatedTheme.propDefault)
    document.documentElement.style.setProperty('--prop-gray', consolidatedTheme.propGray)
    document.documentElement.style.setProperty('--prop-brown', consolidatedTheme.propBrown)
    document.documentElement.style.setProperty('--prop-orange', consolidatedTheme.propOrange)
    document.documentElement.style.setProperty('--prop-yellow', consolidatedTheme.propYellow)
    document.documentElement.style.setProperty('--prop-green', consolidatedTheme.propGreen)
    document.documentElement.style.setProperty('--prop-blue', consolidatedTheme.propBlue)
    document.documentElement.style.setProperty('--prop-purple', consolidatedTheme.propPurple)
    document.documentElement.style.setProperty('--prop-pink', consolidatedTheme.propPink)
    document.documentElement.style.setProperty('--prop-red', consolidatedTheme.propRed)

    return consolidatedTheme
}

export function setMattermostTheme(theme: any): Theme {
    if (!theme) {
        return setTheme(defaultTheme)
    }

    document.documentElement.style.setProperty('--center-channel-bg-rgb', color(theme.centerChannelBg).rgb().array().join(', '))
    document.documentElement.style.setProperty('--center-channel-color-rgb', color(theme.centerChannelColor).rgb().array().join(', '))
    document.documentElement.style.setProperty('--button-bg-rgb', color(theme.buttonBg).rgb().array().join(', '))
    document.documentElement.style.setProperty('--button-color-rgb', color(theme.buttonColor).rgb().array().join(', '))
    document.documentElement.style.setProperty('--sidebar-bg-rgb', color(theme.sidebarBg).rgb().array().join(', '))
    document.documentElement.style.setProperty('--sidebar-text-rgb', color(theme.sidebarText).rgb().array().join(', '))
    document.documentElement.style.setProperty('--link-color-rgb', theme.linkColor)
    document.documentElement.style.setProperty('--sidebar-text-active-border-rgb', color(theme.sidebarTextActiveBorder).rgb().array().join(', '))

    return setTheme({
        ...defaultTheme,
        mainBg: color(theme.centerChannelBg).rgb().array().join(', '),
        mainFg: color(theme.centerChannelColor).rgb().array().join(', '),
        buttonBg: color(theme.buttonBg).rgb().array().join(', '),
        buttonFg: color(theme.buttonColor).rgb().array().join(', '),
        sidebarBg: color(theme.sidebarBg).rgb().array().join(', '),
        sidebarFg: color(theme.sidebarColor || '#ffffff').rgb().array().join(', '),
        sidebarTextActiveBorder: color(theme.sidebarTextActiveBorder).rgb().array().join(', '),
        link: theme.linkColor,
    })
}

function setActiveThemeName(consolidatedTheme: Theme, theme: Theme | null) {
    if (theme === null) {
        activeThemeName = systemThemeName
    } else if (isEqual(consolidatedTheme, darkTheme)) {
        activeThemeName = darkThemeName
    } else if (isEqual(consolidatedTheme, lightTheme)) {
        activeThemeName = lightThemeName
    } else {
        activeThemeName = defaultThemeName
    }
}

export function loadTheme(): Theme {
    const themeStr = UserSettings.theme
    if (themeStr) {
        try {
            const theme = JSON.parse(themeStr)
            const consolidatedTheme = setTheme(theme)
            setActiveThemeName(consolidatedTheme, theme)
            return consolidatedTheme
        } catch (e) {
            return setTheme(null)
        }
    } else {
        return setTheme(null)
    }
}

export function initThemes(): void {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
    const changeHandler = () => {
        const themeStr = UserSettings.theme
        if (!themeStr) {
            setTheme(null)
        }
    }
    if (darkThemeMq.addEventListener) {
        darkThemeMq.addEventListener('change', changeHandler)
    } else if (darkThemeMq.addListener) {
        // Safari and Mac app support
        darkThemeMq.addListener(changeHandler)
    }
    loadTheme()
}

export function getSelectBaseStyle() {
    return {
        dropdownIndicator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none !important',
        }),
        indicatorSeparator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none',
        }),
        loadingIndicator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none',
        }),
        clearIndicator: (provided: CSSObject): CSSObject => ({
            ...provided,
            display: 'none',
        }),
        menu: (provided: CSSObject): CSSObject => ({
            ...provided,
            width: 'unset',
            background: 'rgb(var(--center-channel-bg-rgb))',
        }),
        option: (provided: CSSObject, state: { isFocused: boolean }): CSSObject => ({
            ...provided,
            background: state.isFocused ? 'rgba(var(--center-channel-color-rgb), 0.1)' : 'rgb(var(--center-channel-bg-rgb))',
            color: state.isFocused ? 'rgb(var(--center-channel-color-rgb))' : 'rgb(var(--center-channel-color-rgb))',
            padding: '2px 8px',
        }),
        control: (): CSSObject => ({
            border: 0,
            width: '100%',
            margin: '4px 0 0 0',

            // display: 'flex',
            // marginTop: 0,
        }),
        valueContainer: (provided: CSSObject): CSSObject => ({
            ...provided,
            padding: '0 5px',
            overflow: 'unset',
        }),
        singleValue: (provided: CSSObject): CSSObject => ({
            ...provided,
            color: 'rgb(var(--center-channel-color-rgb))',
            overflow: 'unset',
            maxWidth: 'calc(100% - 20px)',
        }),
        input: (provided: CSSObject): CSSObject => ({
            ...provided,
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            marginTop: 0,
        }),
        menuList: (provided: CSSObject): CSSObject => ({
            ...provided,
            overflowY: 'auto',
            overflowX: 'hidden',
        }),
    }
}

export function getActiveThemeName(): string {
    return activeThemeName || defaultThemeName
}
