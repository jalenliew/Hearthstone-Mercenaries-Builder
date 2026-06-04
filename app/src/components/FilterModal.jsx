import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import axios from '../api/axios';
import Button from '../components/Button';
import '../styles/components/FilterModal.scss';

const STAT_RANGES = {
    manaCost: [0, 30],
    attack: [0, 20],
    health: [1, 20],
};

const FilterModal = ({ isOpen, onClose, onApply, onReset, gameMode = 'constructed' }) => {
    const [sets, setSets] = useState([]);
    const [classes, setClasses] = useState([]);
    const [rarities, setRarities] = useState([]);
    const [types, setTypes] = useState([]);
    const [minionTypes, setMinionTypes] = useState([]);
    const [keywords, setKeywords] = useState([]);

    const [selectedSets, setSelectedSets] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [selectedRarities, setSelectedRarities] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedMinionTypes, setSelectedMinionTypes] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [collectible, setCollectible] = useState('1');
    const [statsRange, setStatsRange] = useState({
        manaCost: [0, 30],
        attack: [0, 20],
        health: [1, 20],
    });

    const fetchMetadata = useCallback(async (type, setter) => {
        try {
            const res = await axios.get(`/api/battlenet/hearthstone/metadata/${type}`, {
                params: { region: 'us', locale: 'en_US' }
            });
            setter(res.data.data || []);
        } catch (err) {
            console.error(`Failed to fetch metadata/${type}`, err);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        if (sets.length === 0) fetchMetadata('sets', setSets);
        if (classes.length === 0) fetchMetadata('classes', setClasses);
        if (rarities.length === 0) fetchMetadata('rarities', setRarities);
        if (types.length === 0) fetchMetadata('types', setTypes);
        if (minionTypes.length === 0) fetchMetadata('minionTypes', setMinionTypes);
        if (keywords.length === 0) fetchMetadata('keywords', setKeywords);
    }, [isOpen]);

    const toggleItem = (list, setList, slug) => {
        setList(list.includes(slug)
            ? list.filter(s => s !== slug)
            : [...list, slug]
        );
    };

    const handleStatChange = (stat, index, value) => {
        const parsed = parseInt(value);
        if (isNaN(parsed)) return;
        const [min, max] = statsRange[stat];
        const [absMin, absMax] = STAT_RANGES[stat];
        const newRange = [...statsRange[stat]];

        if (index === 0) {
            newRange[0] = Math.min(Math.max(parsed, absMin), max);
        } else {
            newRange[1] = Math.max(Math.min(parsed, absMax), min);
        }
        setStatsRange({ ...statsRange, [stat]: newRange });
    };

    const handleReset = () => {
        setSelectedSets([]);
        setSelectedClasses([]);
        setSelectedRarities([]);
        setSelectedTypes([]);
        setSelectedMinionTypes([]);
        setSelectedKeywords([]);
        setCollectible('1');
        setStatsRange({
            manaCost: [0, 30],
            attack: [0, 20],
            health: [1, 20],
        });
        onReset?.();
    };

    const handleApply = () => {
        const filters = {
            set: selectedSets,
            cardClass: selectedClasses,
            rarity: selectedRarities,
            type: selectedTypes,
            minionType: selectedMinionTypes,
            keyword: selectedKeywords,
            collectible,
            manaCost: rangeToArray(statsRange.manaCost, STAT_RANGES.manaCost),
            attack: rangeToArray(statsRange.attack, STAT_RANGES.attack),
            health: rangeToArray(statsRange.health, STAT_RANGES.health),
        };
        onApply(filters);
        onClose();
    };

    const rangeToArray = ([min, max], [absMin, absMax]) => {
        if (min === absMin && max === absMax) return undefined;
        return Array.from({ length: max - min }, (_, i) => min + i);
    };

    const ChipGroup = ({ label, items, selected, onToggle }) => (
        <div className='FilterModal-section'>
            <h5 className='FilterModal-sectionTitle'>{label}</h5>
            <div className='FilterModal-chipGrid'>
                {items.map(item => (
                    <button
                        key={item.slug}
                        className={`FilterModal-chip ${selected.includes(item.slug) ? 'is-selected' : ''}`}
                        onClick={() => onToggle(item.slug)}
                    >
                        {item.name.value}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} className='FilterModal' overlayClassName='FilterModal-overlay' ariaHideApp={false}>
            <div className='FilterModal-header'>
                <h4 className='FilterModal-title'>Filters</h4>
                <button className='FilterModal-close' onClick={onClose}>✕</button>
            </div>

            <div className='FilterModal-body'>
                <ChipGroup label='Set' items={sets} selected={selectedSets} onToggle={(slug) => toggleItem(selectedSets, setSelectedSets, slug)} />
                <ChipGroup label='Class' items={classes} selected={selectedClasses} onToggle={(slug) => toggleItem(selectedClasses, setSelectedClasses, slug)} />
                <ChipGroup label='Rarity' items={rarities} selected={selectedRarities} onToggle={(slug) => toggleItem(selectedRarities, setSelectedRarities, slug)} />
                <ChipGroup label='Type' items={types} selected={selectedTypes} onToggle={(slug) => toggleItem(selectedTypes, setSelectedTypes, slug)} />
                <ChipGroup label='Minion Type' items={minionTypes} selected={selectedMinionTypes} onToggle={(slug) => toggleItem(selectedMinionTypes, setSelectedMinionTypes, slug)} />
                <ChipGroup label='Keyword' items={keywords} selected={selectedKeywords} onToggle={(slug) => toggleItem(selectedKeywords, setSelectedKeywords, slug)} />

                <div className='FilterModal-section'>
                    <h5 className='FilterModal-sectionTitle'>Collectible</h5>
                    <div className='FilterModal-chipGrid'>
                        {[['1', 'Collectible Only'], ['0', 'Non-Collectible Only'], ['', 'Both']].map(([val, label]) => (
                            <button
                                key={val}
                                className={`FilterModal-chip ${collectible === val ? 'is-selected' : ''}`}
                                onClick={() => setCollectible(val)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {['manaCost', 'attack', 'health'].map(stat => (
                    <div key={stat} className='FilterModal-section'>
                        <h5 className='FilterModal-sectionTitle'>{stat.charAt(0).toUpperCase() + stat.slice(1)}</h5>
                        <div className='FilterModal-statRow'>
                            <input
                                type='number'
                                value={statsRange[stat][0]}
                                min={STAT_RANGES[stat][0]}
                                max={statsRange[stat][1]}
                                onChange={(e) => handleStatChange(stat, 0, e.target.value)}
                            />
                            <span>to</span>
                            <input
                                type='number'
                                value={statsRange[stat][1]}
                                min={statsRange[stat][0]}
                                max={STAT_RANGES[stat][1]}
                                onChange={(e) => handleStatChange(stat, 1, e.target.value)}
                            />
                            <button
                                className='FilterModal-resetStat'
                                onClick={() => setStatsRange({ ...statsRange, [stat]: [...STAT_RANGES[stat]] })}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className='FilterModal-actions'>
                <Button text='Cancel' onClick={onClose} />
                <Button text='Reset All' onClick={handleReset} />
                <Button text='Apply' onClick={handleApply} />
            </div>
        </Modal>
    );
};

export default FilterModal;