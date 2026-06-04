import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import Button from '../components/Button';
import Modal from 'react-modal';
import Select from 'react-select';
import '../styles/components/FilterModal.scss';

const FilterModal = ({ text, onClick }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [gameMode, setGameMode] = useState("constructed");
    const [cardSets, setCardSets] = useState([]);
    const [metadata, setMetadata] = useState({});
    
    const fetchMetadata = useCallback(async (type) => {
        const res = await axios.get('/api/battlenet/hearthstone/metadata', {
            params: type
        });
        const data = res.data.data;
        setMetadata(data);
        return data;
    }, [gameMode]);

    useEffect(() => {
        const res = fetchMetadata("");
    }, []);

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

    return(
            <Modal
                isOpen={modalIsOpen}
                className='CardFilter'
                ariaHideApp={false}
            >
                <h4 className='CardFilter-title'>Advanced Filters</h4>
                <div className='CardFilter-body'>
                    <div className='CardFilter-set'>
                        <label htmlFor='setSelect'>Set:</label>
                        <Button id='setSelect' onClick={(e) => {console.log(e)}} ></Button>
                    </div>
                    {/* <div className='CardFilter-selectRow'>
                        <label htmlFor='setSelect'>Set:</label>
                        <Select options={metadata.sets?.map(s => ({ ...s, label: s.name, value: s.slug }))} onChange={(e) => handleSelectOption('set', e)} value={selectedOptions.set} isMulti className='CardFilter-select' id='setSelect' />
                    </div>
                    <div className='CardFilter-selectRow'>
                        <label htmlFor='classSelect'>Class:</label>
                        <Select options={metadata.classes?.map(c => ({ ...c, label: c.name, value: c.slug }))} onChange={(e) => handleSelectOption('class', e)} value={selectedOptions.class} isMulti className='CardFilter-select' id='classSelect' />
                    </div> */}
                    {/* <div className='CardFilter-stats'>
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
                    </div> */}
                    {/* <div className='CardFilter-selectRow'>
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
                    </div> */}
                </div>
                <div className='CardFilter-actions'>
                    <Button text='Cancel' onClick={closeModal} />
                    <Button text='Reset' onClick={handleFilterReset} />
                    <Button text='Apply' onClick={handleFilterApply} />
                </div>
            </Modal>
    );
};

export default FilterModal;