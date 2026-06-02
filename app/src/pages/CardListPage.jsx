import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Select from 'react-select';
import Button from '../components/Button';
import Modal from 'react-modal';
import Searchbar from '../components/Searchbar';
import '../styles/pages/CardListPage.scss';

const PREFETCH_NEIGHBORS = 2;

const CardListPage = ({ pageSize, onCardClick }) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [cardPage, setCardPage] = useState([]);
    const [maxPages, setMaxPages] = useState(0);
    const [sortOption, setSortOption] = useState('name');
    const [isAscending, setIsAscending] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [filterParams, setFilterParams] = useState({});
    const [metadata, setMetadata] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({
        set: [], class: [], rarity: [], type: [], minionType: [], keyword: []
    });
    const [collectible, setCollectible] = useState('f');
    const [statsRange, setStatsRange] = useState({
        manaCost: [0, 30, 0, 30],
        attack: [0, 20, 0, 20],
        health: [1, 20, 1, 20],
    });

    const cache = useRef({});
    const navigate = useNavigate();

    const sortOptions = [
        { value: 'name', label: 'NAME' },
        { value: 'manaCost', label: 'MANACOST' },
        { value: 'attack', label: 'ATTACK' },
        { value: 'health', label: 'HEALTH' },
        { value: 'class', label: 'CLASS' },
    ];

    const buildParams = useCallback((page) => ({
        region: 'us',
        page,
        pageSize: pageSize || 16,
        sort: isAscending ? `${sortOption}:asc` : `${sortOption}:desc`,
        locale: 'en_US',
        textFilter: searchValue,
        ...filterParams
    }), [pageSize, isAscending, sortOption, searchValue, filterParams]);

    const cacheKey = useCallback((page) => {
        return JSON.stringify(buildParams(page));
    }, [buildParams]);

    const fetchPage = useCallback(async (page) => {
        const key = cacheKey(page);
        if (cache.current[key]) return cache.current[key];
        const res = await axios.get('/api/battlenet/hearthstone/cards/page', {
            params: buildParams(page)
        });
        const data = res.data.data;
        cache.current[key] = data;
        return data;
    }, [buildParams, cacheKey]);

    useEffect(() => {
        cache.current = {};
    }, [isAscending, sortOption, searchValue, filterParams]);

    useEffect(() => {
        const loadPage = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPage(pageNumber);
                setMaxPages(data.pageCount);
                setCardPage(data.cards?.length === 0 ? ['N/A'] : data.cards);

                const neighbors = [];
                for (let i = 1; i <= PREFETCH_NEIGHBORS; i++) {
                    if (pageNumber - i >= 1) neighbors.push(pageNumber - i);
                    if (pageNumber + i <= data.pageCount) neighbors.push(pageNumber + i);
                }
                neighbors.forEach(p => fetchPage(p).catch(() => {}));
            } catch (err) {
                console.error('Failed to fetch cards', err);
                setCardPage(['N/A']);
            } finally {
                setIsLoading(false);
            }
        };
        loadPage();
    }, [pageNumber, fetchPage]);

    const handlePrev = () => setPageNumber(p => Math.max(1, p - 1));
    const handleNext = () => setPageNumber(p => Math.min(maxPages, p + 1));

    const handlePageChange = (e) => {
        const page = parseInt(e.target.value);
        if (!isNaN(page)) setPageNumber(Math.min(Math.max(1, page), maxPages));
    };

    const handleSort = (value) => {
        setPageNumber(1);
        if (typeof value === 'boolean') {
            setIsAscending(value);
        } else {
            setSortOption(value.value);
        }
    };

    const handleSearch = (value) => {
        setPageNumber(1);
        setSearchValue(value);
    };

    const handleCardDetails = (card) => {
        if (onCardClick) {
            onCardClick(card);
        } else {
            navigate('details', { state: card });
        }
    };

    const openModal = async () => {
        if (Object.keys(metadata).length === 0) {
            try {
                const res = await axios.get('/api/battlenet/hearthstone/metadata', {
                    params: { region: 'us', locale: 'en_US' }
                });
                setMetadata(res.data.data);
            } catch (err) {
                console.error('Failed to fetch metadata', err);
            }
        }
        setModalIsOpen(true);
    };

    const closeModal = () => setModalIsOpen(false);

    const handleSelectOption = (param, values) => {
        setSelectedOptions({ ...selectedOptions, [param]: values });
    };

    const getPaginationPages = () => {
        const pages = new Set();
        pages.add(1);
        pages.add(maxPages);
        for (let i = -PREFETCH_NEIGHBORS; i <= PREFETCH_NEIGHBORS; i++) {
            const p = pageNumber + i;
            if (p >= 1 && p <= maxPages) pages.add(p);
        }
        return Array.from(pages).sort((a, b) => a - b);
    };

    const handleFilterReset = () => {
        setFilterParams({});
        setSelectedOptions({ set: [], class: [], rarity: [], type: [], minionType: [], keyword: [] });
        setCollectible('f');
        setStatsRange({
            manaCost: [0, 30, 0, 30],
            attack: [0, 20, 0, 20],
            health: [1, 20, 1, 20]
        });
        setPageNumber(1);
    };

    const handleFilterApply = () => {
        let selectValues = {};
        Object.keys(selectedOptions).forEach((param) => {
            selectValues[param] = selectedOptions[param].map(v => v.slug);
        });
        let collectibleVal;
        if (collectible === 't') collectibleVal = [0, 1];
        else if (collectible === 'o') collectibleVal = 0;

        let statsValues = { manaCost: [], attack: [], health: [] };
        Object.keys(statsRange).forEach((stat) => {
            for (let i = statsRange[stat][0], j = 0; i < statsRange[stat][1]; i++, j++) {
                statsValues[stat][j] = i;
            }
        });

        setFilterParams({ ...selectValues, collectible: collectibleVal, ...statsValues });
        setPageNumber(1);
        setModalIsOpen(false);
    };

    const handleStats = (param) => {
        const stat = param.slice(0, -3);
        const isMinimum = param.slice(-3) === 'Min';
        const arr = [...statsRange[stat]];
        const min = parseInt(document.getElementById(`${stat}Min`).value);
        const max = parseInt(document.getElementById(`${stat}Max`).value);

        if (isMinimum) {
            arr[0] = Math.max(arr[2], Math.min(min, arr[3]));
            if (arr[0] > arr[1]) arr[1] = arr[0];
        } else {
            arr[1] = Math.min(arr[3], Math.max(max, arr[2]));
            if (arr[1] < arr[0]) arr[0] = arr[1];
        }
        setStatsRange({ ...statsRange, [stat]: arr });
    };

    const handleStatsReset = (param) => {
        const arr = [...statsRange[param]];
        arr[0] = arr[2];
        arr[1] = arr[3];
        setStatsRange({ ...statsRange, [param]: arr });
    };

    return (
        <div className='CardList'>
            <Modal
                isOpen={modalIsOpen}
                className='CardFilter'
                ariaHideApp={false}
            >
                <h4 className='CardFilter-title'>Advanced Filters</h4>
                <div className='CardFilter-body'>
                    <div className='CardFilter-selectRow'>
                        <label htmlFor='setSelect'>Set:</label>
                        <Select options={metadata.sets?.map(s => ({ ...s, label: s.name, value: s.slug }))} onChange={(e) => handleSelectOption('set', e)} value={selectedOptions.set} isMulti className='CardFilter-select' id='setSelect' />
                    </div>
                    <div className='CardFilter-selectRow'>
                        <label htmlFor='classSelect'>Class:</label>
                        <Select options={metadata.classes?.map(c => ({ ...c, label: c.name, value: c.slug }))} onChange={(e) => handleSelectOption('class', e)} value={selectedOptions.class} isMulti className='CardFilter-select' id='classSelect' />
                    </div>
                    <div className='CardFilter-stats'>
                        {['manaCost', 'attack', 'health'].map(stat => (
                            <div key={stat} className='CardFilter-statRow'>
                                <input type='number' id={`${stat}Min`} value={isNaN(statsRange[stat][0]) ? '' : statsRange[stat][0]} onChange={() => handleStats(`${stat}Min`)} />
                                <p>&le; {stat.toUpperCase()} &le;</p>
                                <input type='number' id={`${stat}Max`} value={isNaN(statsRange[stat][1]) ? '' : statsRange[stat][1]} onChange={() => handleStats(`${stat}Max`)} />
                                <Button text='Reset' onClick={() => handleStatsReset(stat)}></Button>
                            </div>
                        ))}
                    </div>
                    <div className='CardFilter-collectible'>
                        <p>Show Non-Collectible Cards:</p>
                        {[['t', 'True'], ['f', 'False'], ['o', 'Only Non-Collectible']].map(([val, label]) => (
                            <React.Fragment key={val}>
                                <input type='radio' id={`collectible_${val}`} checked={collectible === val} onChange={() => setCollectible(val)} />
                                <label htmlFor={`collectible_${val}`}>{label}</label>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className='CardFilter-selectRow'>
                        <label htmlFor='raritySelect'>Rarity:</label>
                        <Select options={metadata.rarities?.map(r => ({ ...r, label: r.name, value: r.slug }))} onChange={(e) => handleSelectOption('rarity', e)} value={selectedOptions.rarity} isMulti className='CardFilter-select' id='raritySelect' />
                    </div>
                    <div className='CardFilter-selectRow'>
                        <label htmlFor='typeSelect'>Type:</label>
                        <Select options={metadata.types?.map(t => ({ ...t, label: t.name, value: t.slug }))} onChange={(e) => handleSelectOption('type', e)} value={selectedOptions.type} isMulti className='CardFilter-select' id='typeSelect' />
                    </div>
                    <div className='CardFilter-selectRow'>
                        <label htmlFor='minionTypeSelect'>Minion Type:</label>
                        <Select options={metadata.minionTypes?.map(m => ({ ...m, label: m.name, value: m.slug }))} onChange={(e) => handleSelectOption('minionType', e)} value={selectedOptions.minionType} isMulti className='CardFilter-select' id='minionTypeSelect' />
                    </div>
                    <div className='CardFilter-selectRow'>
                        <label htmlFor='keywordSelect'>Keyword:</label>
                        <Select options={metadata.keywords?.map(k => ({ ...k, label: k.name, value: k.slug }))} onChange={(e) => handleSelectOption('keyword', e)} value={selectedOptions.keyword} isMulti className='CardFilter-select' id='keywordSelect' />
                    </div>
                </div>
                <div className='CardFilter-actions'>
                    <Button text='Cancel' onClick={closeModal} />
                    <Button text='Reset' onClick={handleFilterReset} />
                    <Button text='Apply' onClick={handleFilterApply} />
                </div>
            </Modal>

            <div className='CardList-controls'>
                <div className='CardList-sort'>
                    <label htmlFor='sortSelect'>Sort by:</label>
                    <Select options={sortOptions} className='CardList-sortSelect' onChange={handleSort} id='sortSelect' defaultValue={{ value: 'name', label: 'NAME' }} />
                    <input type='radio' id='asc' checked={isAscending} onChange={() => handleSort(true)} />
                    <label htmlFor='asc'>Ascending</label>
                    <input type='radio' id='desc' checked={!isAscending} onChange={() => handleSort(false)} />
                    <label htmlFor='desc'>Descending</label>
                </div>
                <Searchbar onClick={handleSearch} />
                <Button text='Advanced' onClick={openModal} />
            </div>

            <div className={`CardList-grid ${isLoading ? 'is-loading' : ''}`}>
                {cardPage.map((card) => {
                    if (card === 'N/A') return <h2 key='na' className='CardList-empty'>No Cards Found</h2>;
                    return (
                        <div className='CardList-card' id={card.id} key={card.id}>
                            <img src={card.image} className='CardList-cardImage' onClick={() => handleCardDetails(card)} alt={card.name} />
                        </div>
                    );
                })}
            </div>

            <div className='CardList-pagination'>
                <button
                    className='CardList-arrowButton'
                    onClick={handlePrev}
                    disabled={pageNumber === 1}
                >
                    ‹
                </button>
                <div className='CardList-paginationPages'>
                    {getPaginationPages().map((p, i, arr) => (
                        <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && <span className='CardList-ellipsis'>…</span>}
                            <button
                                className={`CardList-pageButton ${p === pageNumber ? 'is-active' : ''}`}
                                onClick={() => setPageNumber(p)}
                            >
                                {p}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
                <button
                    className='CardList-arrowButton'
                    onClick={handleNext}
                    disabled={pageNumber === maxPages}
                >
                    ›
                </button>
                <div className='CardList-pageInput'>
                    Go to:
                    <input
                        type='number'
                        min={1}
                        max={maxPages}
                        value={pageNumber}
                        onChange={(e) => setPageNumber(Number(e.target.value))}
                        onBlur={handlePageChange}
                        onKeyDown={(e) => e.key === 'Enter' && handlePageChange(e)}
                    />
                </div>
            </div>
        </div>
    );
};

export default CardListPage;