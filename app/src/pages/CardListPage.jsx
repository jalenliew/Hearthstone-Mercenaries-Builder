import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Button from '../components/Button';
import Searchbar from '../components/Searchbar';
import FilterModal from '../components/FilterModal';
import CardGrid from '../components/CardGrid';
import '../styles/pages/CardListPage.scss';

const sortOptions = [
    { value: 'name',         label: 'Name' },
    { value: 'manaCost',     label: 'Mana Cost' },
    { value: 'attack',       label: 'Attack' },
    { value: 'health',       label: 'Health' },
    { value: 'dateAdded',    label: 'Date Added' },
    { value: 'class',        label: 'Class' },
    { value: 'groupByClass', label: 'Group By Class' },
];

const GAME_MODES = [
    { value: 'constructed',   label: 'Constructed' },
    { value: 'battlegrounds', label: 'Battlegrounds' },
    { value: 'mercenaries',   label: 'Mercenaries' },
];

const CardListPage = ({ pageSize, onCardClick }) => {
    const [sortOption, setSortOption] = useState('name');
    const [isAscending, setIsAscending] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [filterParams, setFilterParams] = useState({});
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [gameMode, setGameMode] = useState('constructed');

    const navigate = useNavigate();

    const handleSort = (value) => {
        if (typeof value === 'boolean') {
            setIsAscending(value);
        } else {
            setSortOption(value.value);
        }
    };

    const handleGameModeChange = (mode) => {
        setGameMode(mode);
        setFilterParams({});
    };

    const handleCardClick = (card) => {
        if (onCardClick) {
            onCardClick(card);
        } else {
            navigate('details', { state: card });
        }
    };

    return (
        <div className='CardList'>
            <FilterModal
                key={gameMode}
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={(filters) => setFilterParams(filters)}
                onReset={() => setFilterParams({})}
                gameMode={gameMode}
            />

            <div className='CardList-controls'>
                <div className='CardList-gameModes'>
                    {GAME_MODES.map(({ value, label }) => (
                        <button
                            key={value}
                            className={`CardList-gameModeButton ${gameMode === value ? 'is-active' : ''}`}
                            onClick={() => handleGameModeChange(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className='CardList-sort'>
                    <label htmlFor='sortSelect'>Sort by:</label>
                    <Select
                        options={sortOptions}
                        className='CardList-sortSelect'
                        onChange={handleSort}
                        id='sortSelect'
                        defaultValue={{ value: 'name', label: 'Name' }}
                    />
                    <input type='radio' id='asc' checked={isAscending} onChange={() => handleSort(true)} />
                    <label htmlFor='asc'>Ascending</label>
                    <input type='radio' id='desc' checked={!isAscending} onChange={() => handleSort(false)} />
                    <label htmlFor='desc'>Descending</label>
                </div>
                <Searchbar onClick={(value) => setSearchValue(value)} />
                <Button text='Filters' onClick={() => setFilterModalOpen(true)} />
            </div>

            <CardGrid
                pageSize={pageSize}
                filterParams={filterParams}
                sortOption={sortOption}
                isAscending={isAscending}
                searchValue={searchValue}
                gameMode={gameMode}
                onCardClick={handleCardClick}
            />
        </div>
    );
};

export default CardListPage;