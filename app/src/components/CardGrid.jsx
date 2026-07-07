import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../api/axios';
import '../styles/components/CardGrid.scss';

const PREFETCH_NEIGHBORS = 2;

const CardGrid = ({ pageSize = 16, filterParams = {}, sortOption = 'name', isAscending = true, isGroupByClass = false, searchValue = '', gameMode = 'constructed', onCardClick }) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [cardPage, setCardPage] = useState([]);
    const [maxPages, setMaxPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const cache = useRef({});

    const buildParams = useCallback((page) => ({
        region: 'us',
        page,
        pageSize,
        sort: `${sortOption}` + (isAscending ? ':asc' : ':desc') + (isGroupByClass ? ',groupByClass' + (isAscending ? ':asc' : ':desc') : ''),
        locale: 'en_US',
        textFilter: searchValue,
        gameMode,
        ...filterParams
    }), [pageSize, isAscending, isGroupByClass, sortOption, searchValue, gameMode, filterParams]);

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

    const resolveImage = (card, locale = 'en_US') => {
        if (!card) return '';
        if (gameMode == 'battlegrounds') {
            if (card.battlegrounds?.image) {
                return card.battlegrounds.image;
            } else if (card.battlegrounds?.imageGold) {
                return card.battlegrounds.imageGold;
            }
        }
        if (card.image?.value) {
            return card.image.value;
        } else if (card.image?.values) {
            return card.image.values[locale];
        } else if (card.imageGold?.value) {
            return card.imageGold.value;
        } else if (card.imageGold?.values) {
            return card.imageGold.values[locale];
        } else {
            return '';
        }
    };

    useEffect(() => {
        cache.current = {};
        setPageNumber(1);
    }, [isAscending, sortOption, searchValue, filterParams, gameMode]);

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

    return (
        <div className='CardGrid'>
            <div className={`CardGrid-grid ${isLoading ? 'is-loading' : ''}`}>
                {cardPage.map((card) => {
                    if (card === 'N/A') return <h2 key='na' className='CardGrid-empty'>No Cards Found</h2>;
                    const src = resolveImage(card);
                    return (
                        <div className={`CardGrid-card ${src == "" ? "CardGrid-card--notFound" : ""}`} id={card.id} key={card.id}>
                            <img
                                src={src}
                                className='CardGrid-cardImage'
                                onClick={() => onCardClick?.(card)}
                                alt={card.name?.value || card.name?.values}
                            />
                            <div className='CardGrid-cardName'>
                                {card.name?.value || card.name?.values}
                                <div className='CardGrid-imageDisclaimer'>
                                    *Image Not Found*
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className='CardGrid-pagination'>
                <button className='CardGrid-arrowButton' onClick={handlePrev} disabled={pageNumber === 1}>‹</button>
                <div className='CardGrid-paginationPages'>
                    {getPaginationPages().map((p, i, arr) => (
                        <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && <span className='CardGrid-ellipsis'>…</span>}
                            <button
                                className={`CardGrid-pageButton ${p === pageNumber ? 'is-active' : ''}`}
                                onClick={() => setPageNumber(p)}
                            >
                                {p}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
                <button className='CardGrid-arrowButton' onClick={handleNext} disabled={pageNumber === maxPages}>›</button>
                <div className='CardGrid-pageInput'>
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

export default CardGrid;