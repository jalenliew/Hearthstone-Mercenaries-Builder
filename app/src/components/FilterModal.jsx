import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from 'react-modal';
import axios from '../api/axios';
import Button from '../components/Button';
import '../styles/components/FilterModal.scss';

const FilterModal = ({ isOpen, onClose, onApply, onReset, gameMode = 'constructed' }) => {
    const [filterOptions, setFilterOptions] = useState(null);
    const [selectedChips, setSelectedChips] = useState({});
    const [numericValues, setNumericValues] = useState({});
    const [collectible, setCollectible] = useState('1');
    const hasFetched = useRef(false);

    const FIELD_MAP = {
        cardSetId:     'set',
        rarityId:      'rarity',
        cardTypeId:    'type',
        spellSchoolId: 'spellSchool',
        minionTypeId:  'minionType',
        keywordId:     'keyword',
        classId:       'cardClass',
    };

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
                data.numericFields.forEach(({ field, min, max }) => {
                    initNumeric[field] = [min, max];
                });
                setNumericValues(initNumeric);

                const initChips = {};
                data.selectableFields.forEach(({ field }) => {
                    initChips[field] = [];
                });
                setSelectedChips(initChips);

                hasFetched.current = true;
            } catch (err) {
                console.error('Failed to fetch filter options', err);
            }
        };
        fetchOptions();
    }, [isOpen, gameMode]);

    const toggleChip = (field, slug) => {
        const current = selectedChips[field] || [];
        setSelectedChips({
            ...selectedChips,
            [field]: current.includes(slug)
                ? current.filter(s => s !== slug)
                : [...current, slug]
        });
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

    const handleReset = () => {
        const initNumeric = {};
        filterOptions?.numericFields.forEach(({ field, min, max }) => {
            initNumeric[field] = [min, max];
        });
        const initChips = {};
        filterOptions?.selectableFields.forEach(({ field }) => {
            initChips[field] = [];
        });
        setNumericValues(initNumeric);
        setSelectedChips(initChips);
        setCollectible('1');
        onReset?.();
    };

    const handleApply = () => {
        const rawFilters = { collectible };

        Object.entries(selectedChips).forEach(([field, slugs]) => {
            if (slugs.length > 0) rawFilters[field] = slugs;
        });

        filterOptions?.numericFields.forEach(({ field, min, max }) => {
            const [selectedMin, selectedMax] = numericValues[field] || [min, max];
            if (selectedMin !== min || selectedMax !== max) {
                rawFilters[field] = rangeToArray(selectedMin, selectedMax);
            }
        });

        const filters = {};
        Object.entries(rawFilters).forEach(([field, value]) => {
            const mappedKey = FIELD_MAP[field] || field;
            filters[mappedKey] = value;
        });

        onApply(filters);
        onClose();
    };

    const rangeToArray = (min, max) =>
        Array.from({ length: max - min + 1 }, (_, i) => min + i);

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
                                key={label}
                                className={`FilterModal-chip ${collectible === val ? 'is-selected' : ''}`}
                                onClick={() => setCollectible(val)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {filterOptions.selectableFields.map(({ field, label, options }) => (
                    <div key={field} className='FilterModal-section'>
                        <h5 className='FilterModal-sectionTitle'>{label.value}</h5>
                        <div className='FilterModal-chipGrid'>
                            {options.map(option => (
                                <button
                                    key={option.slug}
                                    className={`FilterModal-chip ${selectedChips[field]?.includes(option.slug) ? 'is-selected' : ''}`}
                                    onClick={() => toggleChip(field, option.slug)}
                                >
                                    {option.name.value}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {filterOptions.numericFields.map(({ field, label, min, max }) => {
                    const [currentMin, currentMax] = numericValues[field] || [min, max];
                    const range = max - min || 1;
                    return (
                        <div key={field} className='FilterModal-section'>
                            <h5 className='FilterModal-sectionTitle'>
                                {label.value}
                                <span className='FilterModal-sliderValue'>{currentMin} - {currentMax}</span>
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
                                    className={`FilterModal-chip FilterModal-chip--small`}
                                    onClick={() => setNumericValues({
                                        ...numericValues,
                                        [field]: [min, max]
                                    })}
                                >
                                    All
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