import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import '../styles/components/Navbar.scss';

const Navbar = () => {
    return (
        <>
            <header className='HeaderBar'>
                <h1 className='HeaderBar-title'>
                    <NavLink className='HeaderBar-link' to="hearthstone-deckbuilder/">Hearthstone Deck Builder</NavLink>
                </h1>
                <nav className='Navbar'>
                    <NavLink className={({ isActive }) => isActive ? 'Navbar-link is-active' : 'Navbar-link'} to="hearthstone-deckbuilder/arena">Arena Builder</NavLink>
                    <NavLink className={({ isActive }) => isActive ? 'Navbar-link is-active' : 'Navbar-link'} to="hearthstone-deckbuilder/deck">Deck Builder</NavLink>
                    <NavLink className={({ isActive }) => isActive ? 'Navbar-link is-active' : 'Navbar-link'} to="hearthstone-deckbuilder/cards">Card List</NavLink>
                </nav>
            </header>
            <Outlet />
        </>
    );
};

export default Navbar;