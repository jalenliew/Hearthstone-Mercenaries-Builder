import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from 'react-modal';
import axios from '../api/axios';
import Button from '../components/Button';
import '../styles/components/FilterModal.scss';

const resolveLocalized = (value, locale = 'en_US') => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value[locale] || Object.values(value)[0] || '';
    return String(value);
};

const FIELD_MAP = {
    cardSetId:     'set',
    rarityId:      'rarity',
    cardTypeId:    'type',
    spellSchoolId: 'spellSchool',
    minionTypeId:  'minionType',
    keywordId:     'keyword',
    classId:       'cardClass',
};

const FilterModal = ({ isOpen, onClose, onApply, onReset, gameMode = 'constructed' }) => {
    const [filterOptions, setFilterOptions] = useState(null);
    const [selectedChips, setSelectedChips] = useState({});
    const [numericValues, setNumericValues] = useState({});
    const [numericModes, setNumericModes] = useState({});
    const [collectible, setCollectible] = useState('1');
    const [activeSetGroup, setActiveSetGroup] = useState(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!isOpen || hasFetched.current) return;
        const fetchOptions = async () => {
            try {
                const res = await axios.get('/api/battlenet/hearthstone/metadata/filterOptions', {
                    params: { region: 'us', locale: 'en_US', gameMode }
                });
                const data = res.data.data;
                setFilterOptions(data);

                const initNumeric = {};
                const initModes = {};
                data.numericFields.forEach(({ field, min, max }) => {
                    initNumeric[field] = [min, max];
                    initModes[field] = 'all';
                });
                setNumericValues(initNumeric);
                setNumericModes(initModes);

                const initChips = {};
                data.selectableFields.forEach(({ field }) => {
                    initChips[field] = [];
                });
                setSelectedChips(initChips);

                const standard = data.setGroups?.find(g => g.slug === 'standard');
                if (standard) {
                    setActiveSetGroup(standard.slug);
                    setSelectedChips(prev => ({
                        ...prev,
                        cardSetId: standard.cardSets
                    }));
                }

                hasFetched.current = true;
            } catch (err) {
                console.error('Failed to fetch filter options', err);
            }
        };
        fetchOptions();
    }, [isOpen, gameMode]);

    const toggleChip = (field, slug) => {
        if (field === 'cardSetId') setActiveSetGroup(null);

        const current = selectedChips[field] || [];
        setSelectedChips({
            ...selectedChips,
            [field]: current.includes(slug)
                ? current.filter(s => s !== slug)
                : [...current, slug]
        });
    };

    const handleSetGroupClick = (group) => {
        if (activeSetGroup === group.slug) {
            setActiveSetGroup(null);
            setSelectedChips(prev => ({ ...prev, cardSetId: [] }));
        } else {
            setActiveSetGroup(group.slug);
            setSelectedChips(prev => ({ ...prev, cardSetId: group.cardSets }));
        }
    };

    const handleSliderChange = (field, index, value) => {
        const parsed = parseInt(value);
        if (isNaN(parsed)) return;
        const bounds = filterOptions.numericFields.find(f => f.field === field);
        const [currentMin, currentMax] = numericValues[field];
        const newRange = [...numericValues[field]];

        if (index === 0) {
            newRange[0] = Math.min(Math.max(parsed, bounds.min), currentMax);
        } else {
            newRange[1] = Math.max(Math.min(parsed, bounds.max), currentMin);
        }
        setNumericValues({ ...numericValues, [field]: newRange });
    };

    const handleNumericMode = (field, mode) => {
        setNumericModes(prev => ({
            ...prev,
            [field]: prev[field] === mode ? 'all' : mode
        }));
    };

    const getNumericArray = (field, min, max) => {
        const [selectedMin, selectedMax] = numericValues[field] || [min, max];
        const mode = numericModes[field] || 'all';
        const full = Array.from(
            { length: selectedMax - selectedMin + 1 },
            (_, i) => selectedMin + i
        );
        // Something weird going on with 10 cost mana cards being odd
        if (mode === 'odd') return full.filter(n => n % 2 !== 0);
        if (mode === 'even') return full.filter(n => n % 2 === 0);
        return full;
    };

    const handleReset = () => {
        const initNumeric = {};
        const initModes = {};
        filterOptions?.numericFields.forEach(({ field, min, max }) => {
            initNumeric[field] = [min, max];
            initModes[field] = 'all';
        });
        const initChips = {};
        filterOptions?.selectableFields.forEach(({ field }) => {
            initChips[field] = [];
        });
        setNumericValues(initNumeric);
        setNumericModes(initModes);
        setSelectedChips(initChips);
        setCollectible('1');
        setActiveSetGroup(null);
        onReset?.();
    };

    const handleApply = () => {
        const rawFilters = { collectible };

        Object.entries(selectedChips).forEach(([field, slugs]) => {
            if (slugs.length > 0) rawFilters[field] = slugs;
        });

        filterOptions?.numericFields.forEach(({ field, min, max }) => {
            const [selectedMin, selectedMax] = numericValues[field] || [min, max];
            const mode = numericModes[field] || 'all';
            const isDefaultRange = selectedMin === min && selectedMax === max;
            if (!isDefaultRange || mode !== 'all') {
                rawFilters[field] = getNumericArray(field, min, max);
            }
        });

        const filters = {};
        Object.entries(rawFilters).forEach(([field, value]) => {
            filters[FIELD_MAP[field] || field] = value;
        });

        onApply(filters);
        onClose();
    };

    if (!filterOptions) {
        return (
            <Modal isOpen={isOpen} className='FilterModal' overlayClassName='FilterModal-overlay' ariaHideApp={false}>
                <div className='FilterModal-loading'>Loading filters...</div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} className='FilterModal' overlayClassName='FilterModal-overlay' ariaHideApp={false}>
            <div className='FilterModal-header'>
                <h4 className='FilterModal-title'>Filters</h4>
                <button className='FilterModal-close' onClick={onClose}>✕</button>
            </div>

            <div className='FilterModal-body'>

                <div className='FilterModal-section'>
                    <h5 className='FilterModal-sectionTitle'>Collectible</h5>
                    <div className='FilterModal-chipGrid'>
                        {[['1', 'Collectible Only'], ['0', 'Non-Collectible Only'], ['', 'Both']].map(([val, label]) => (
                            <button
                                key={val === '' ? 'both' : val}
                                className={`FilterModal-chip ${collectible === val ? 'is-selected' : ''}`}
                                onClick={() => setCollectible(val)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {filterOptions.setGroups?.length > 0 && (
                    <div className='FilterModal-section'>
                        <h5 className='FilterModal-sectionTitle'>Format</h5>
                        <div className='FilterModal-chipGrid'>
                            {filterOptions.setGroups.map(group => (
                                <button
                                    key={group.slug}
                                    className={`FilterModal-chip ${activeSetGroup === group.slug ? 'is-selected' : ''}`}
                                    onClick={() => handleSetGroupClick(group)}
                                >
                                    {resolveLocalized(group.name)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {filterOptions.selectableFields.map(({ field, label, options }) => (
                    <div key={field} className='FilterModal-section'>
                        <h5 className='FilterModal-sectionTitle'>{resolveLocalized(label)}</h5>
                        <div className='FilterModal-chipGrid'>
                            {options.map(option => (
                                <button
                                    key={option.slug}
                                    className={`FilterModal-chip ${selectedChips[field]?.includes(option.slug) ? 'is-selected' : ''}`}
                                    onClick={() => toggleChip(field, option.slug)}
                                >
                                    {resolveLocalized(option.name)}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {filterOptions.numericFields.map(({ field, label, min, max }) => {
                    const [currentMin, currentMax] = numericValues[field] || [min, max];
                    const range = max - min || 1;
                    const mode = numericModes[field] || 'all';
                    return (
                        <div key={field} className='FilterModal-section'>
                            <h5 className='FilterModal-sectionTitle'>
                                {resolveLocalized(label)}
                                <span className='FilterModal-sliderValue'>{currentMin} – {currentMax}</span>
                            </h5>
                            <div className='FilterModal-sliderWrapper'>
                                <div
                                    className='FilterModal-sliderTrack'
                                    style={{
                                        '--range-left': `${((currentMin - min) / range) * 100}%`,
                                        '--range-right': `${((max - currentMax) / range) * 100}%`
                                    }}
                                />
                                <input
                                    type='range'
                                    className='FilterModal-slider FilterModal-slider--min'
                                    min={min}
                                    max={max}
                                    value={currentMin}
                                    onChange={(e) => handleSliderChange(field, 0, e.target.value)}
                                />
                                <input
                                    type='range'
                                    className='FilterModal-slider FilterModal-slider--max'
                                    min={min}
                                    max={max}
                                    value={currentMax}
                                    onChange={(e) => handleSliderChange(field, 1, e.target.value)}
                                />
                            </div>
                            <div className='FilterModal-sliderOddEven'>
                                <button
                                    className={`FilterModal-chip FilterModal-chip--small ${mode === 'all' ? 'is-selected' : ''}`}
                                    onClick={() => handleNumericMode(field, 'all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`FilterModal-chip FilterModal-chip--small ${mode === 'odd' ? 'is-selected' : ''}`}
                                    onClick={() => handleNumericMode(field, 'odd')}
                                >
                                    Odd
                                </button>
                                <button
                                    className={`FilterModal-chip FilterModal-chip--small ${mode === 'even' ? 'is-selected' : ''}`}
                                    onClick={() => handleNumericMode(field, 'even')}
                                >
                                    Even
                                </button>
                            </div>
                        </div>
                    );
                })}
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