import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Button from '../components/Button';
import '../styles/pages/CardDetailsPage.scss';

const CardDetailsPage = ({ card: cardProp, onBackButton }) => {
    const [keywordData, setKeywordData] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    const card = cardProp || location.state;

    useEffect(() => {
        if (!card) return;

        const fetchKeywords = async () => {
            try {
                const res = await axios.get('/api/battlenet/hearthstone/metadata', {
                    params: { region: 'us', locale: 'en_US' }
                });
                const allKeywords = res.data.data.keywords || [];
                setKeywordData(
                    allKeywords.filter((keyword) =>
                        card.keywordIds?.includes(keyword.id)
                    )
                );
            } catch (err) {
                console.error('Failed to fetch keywords', err);
            }
        };

        if (card.keywordIds?.length > 0) {
            fetchKeywords();
        }
    }, [card]);

    const handleBack = () => {
        if (onBackButton) {
            onBackButton();
        } else {
            navigate(-1);
        }
    };

    if (!card) {
        return (
            <div className='cardDetailsPage'>
                <Button text='Go Back' onClick={handleBack} />
                <div>
                    <p>Invalid Data</p>
                    <Link to='..'>Click here to go back</Link>
                </div>
            </div>
        );
    }

    return (
        <div className='cardDetailsPage'>
            <Button text='Go Back' onClick={handleBack} />
            <div className='cardDetails'>
                <img src={card.image} alt={card.name} />
                <div className='keywordWrapper'>
                    {keywordData.map((keyword) => (
                        <div key={keyword.id} className='keyword'>
                            <b>{keyword.name}</b>
                            <p>{keyword.refText}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CardDetailsPage;