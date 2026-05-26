import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArenaBuilderPage from './pages/ArenaBuilderPage';
import DeckBuilderPage from './pages/DeckBuilderPage';
import CardListPage from './pages/CardListPage';
import NoPage from './pages/NoPage';
import CreateNewDeckPage from './pages/CreateNewDeckPage';
import CardDetailsPage from './pages/CardDetailsPage';

const AppRouter = () => {

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/hearthstone-deckbuilder">
                    <Route index element={<HomePage />} />
                    <Route path="arena" element={<ArenaBuilderPage />} />
                    <Route path="deck">
                        <Route index element={<DeckBuilderPage />} />
                        <Route path="new" element={<CreateNewDeckPage />} />
                    </Route>
                    <Route path="cards">
                        <Route index element={<CardListPage />} />
                        <Route path="details" element={<CardDetailsPage />} />
                    </Route>
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;