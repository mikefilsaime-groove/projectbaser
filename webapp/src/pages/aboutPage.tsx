// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react'
import {Link, useHistory} from 'react-router-dom'

import {IUser} from '../user'
import {getMe} from '../store/users'
import {useAppSelector} from '../store/hooks'

import './aboutPage.scss'

const AboutPage = () => {
    const history = useHistory()
    const user = useAppSelector<IUser|null>(getMe)
    
    const handleBackClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (user) {
            // User is logged in, go to their boards
            history.push('/')
        } else {
            // User is not logged in, go to login page
            history.push('/login')
        }
    }

    return (
        <div className='AboutPage'>
            <div className='about-container'>
                <div className='about-header'>
                    <h1>ProjectBaser</h1>
                    <p className='tagline'>Your collaborative project management platform</p>
                </div>

                <div className='about-content'>
                    <section className='about-section'>
                        <h2>What is ProjectBaser?</h2>
                        <p>
                            ProjectBaser is a powerful, open-source project management tool designed to help teams
                            organize their work, collaborate effectively, and achieve their goals. Built on the foundation
                            of FocalBoard, ProjectBaser provides a flexible workspace where you can create boards, manage
                            tasks, and track progress in real-time.
                        </p>
                    </section>

                    <section className='about-section'>
                        <h2>Key Features</h2>
                        <ul className='features-list'>
                            <li>
                                <strong>Flexible Boards:</strong> Create customizable boards with multiple views including
                                Kanban, table, gallery, and calendar layouts
                            </li>
                            <li>
                                <strong>Multi-Tenant Architecture:</strong> Each organization operates independently with
                                complete data isolation and security
                            </li>
                            <li>
                                <strong>Real-Time Collaboration:</strong> Work together with your team members with live
                                updates and seamless synchronization
                            </li>
                            <li>
                                <strong>Rich Templates:</strong> Get started quickly with pre-built templates for common
                                project types
                            </li>
                            <li>
                                <strong>Custom Properties:</strong> Add custom fields to cards to track the information
                                that matters to your team
                            </li>
                            <li>
                                <strong>Team Management:</strong> Invite team members, manage roles, and control access
                                to your organization's data
                            </li>
                        </ul>
                    </section>

                    <section className='about-section'>
                        <h2>Built With</h2>
                        <p>
                            ProjectBaser is built with modern technologies including React, TypeScript, and Go,
                            ensuring a fast, reliable, and secure experience for all users.
                        </p>
                    </section>

                    <section className='about-section version-info'>
                        <p className='version'>Version 8.0.0</p>
                        <p className='copyright'>Based on FocalBoard by Mattermost, Inc.</p>
                    </section>
                </div>

                <div className='about-actions'>
                    <a
                        href='/'
                        className='back-button'
                        onClick={handleBackClick}
                    >
                        {user ? 'Back to Boards' : 'Go to Login'}
                    </a>
                </div>
            </div>
        </div>
    )
}

export default React.memo(AboutPage)
