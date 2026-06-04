import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Select from 'react-select';
import Button from '../components/Button';
import Searchbar from '../components/Searchbar';
import FilterModal from '../components/FilterModal';
import '../styles/pages/CardListPage.scss';

const PREFETCH_NEIGHBORS = 2;

const CardListPage = ({ pageSize, onCardClick }) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [cardPage, setCardPage] = useState([]);
    const [maxPages, setMaxPages] = useState(0);
    const [sortOption, setSortOption] = useState('name');
    const [isAscending, setIsAscending] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [filterParams, setFilterParams] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const cache = useRef({});
    const navigate = useNavigate();

    const sortOptions = [
        { value: 'name', label: 'Name' },
        { value: 'manaCost', label: 'Mana Cost' },
        { value: 'attack', label: 'Attack' },
        { value: 'health', label: 'Health' },
        { value: 'dateAdded', label: 'Date Added'},
        { value: 'class', label: 'Class' },
        { value: 'groupByClass', label: 'Group By Class'},
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

    const handleFilterApply = (filters) => {
        setFilterParams(filters);
        setPageNumber(1);
    };

    const handleFilterReset = () => {
        setFilterParams({});
        setPageNumber(1);
    };

    return (
        <div className='CardList'>
            <FilterModal
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={handleFilterApply}
                onReset={handleFilterReset}
                gameMode='constructed'
            />
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
                <Button text='Advanced' onClick={() => setFilterModalOpen(true)} />
            </div>

            <div className={`CardList-grid ${isLoading ? 'is-loading' : ''}`}>
                {cardPage.map((card) => {
                    if (card === 'N/A') return <h2 key='na' className='CardList-empty'>No Cards Found</h2>;
                    return (
                        <div className='CardList-card' id={card.id} key={card.id}>
                            <img src={card.image.value} className='CardList-cardImage' onClick={() => handleCardDetails(card)} alt={card.name} />
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