import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GestureCategoryPage.css';

function GestureCategoryPage({ language }) {
    const { type } = useParams();
    const navigate = useNavigate();

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('').map((item) => ({
        label: item.toUpperCase(),
        image: `/sign/${item}.gif`,
    }));

    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((item) => ({
        label: item,
        image: `/sign/${item}.gif`,
    }));

    const phrases = [
        { label: language === 'mr' ? 'नमस्कार' : 'Hello', image: '/sign/hello.gif' },
        { label: language === 'mr' ? 'धन्यवाद' : 'Thank You', image: '/sign/thankyou.gif' },
        { label: language === 'mr' ? 'हो' : 'Yes', image: '/sign/yes.gif' },
        { label: language === 'mr' ? 'नाही' : 'No', image: '/sign/no.gif' },
        { label: language === 'mr' ? 'मदत' : 'Help', image: '/sign/help.gif' },
        { label: language === 'mr' ? 'प्रेम' : 'Love', image: '/sign/love.gif' },
        { label: language === 'mr' ? 'शुभ' : 'Good', image: '/sign/good.gif' },
        { label: language === 'mr' ? 'सकाळ ' : 'Morning', image: '/sign/morning.gif' },
        { label: language === 'mr' ? 'रात्र' : 'Night', image: '/sign/night.gif' },

    ];

    let pageTitle = '';
    let data = [];

    if (type === 'letters') {
        pageTitle = language === 'mr' ? 'अक्षरे' : 'Letters';
        data = letters;
    } else if (type === 'numbers') {
        pageTitle = language === 'mr' ? 'संख्या' : 'Numbers';
        data = numbers;
    } else if (type === 'phrases') {
        pageTitle = language === 'mr' ? 'वाक्ये / शब्द' : 'Phrases';
        data = phrases;
    }

    return (
        <div className="gesture-page">
            <div className="gesture-page-container">
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← {language === 'mr' ? 'मुख्यपृष्ठावर जा' : 'Back to Home'}
                </button>

                <h2 className="page-title">{pageTitle}</h2>

                <div className="gesture-grid">
                    {data.map((item) => (
                        <div className="gesture-card" key={item.label}>
                            <div className="gesture-image-wrapper">
                                <img src={item.image} alt={item.label} className="gesture-image" />
                            </div>
                            <h3>{item.label}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GestureCategoryPage;