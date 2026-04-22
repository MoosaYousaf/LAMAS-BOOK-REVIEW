import { useState } from 'react';
import '../Styles/variables.css';
import '../Styles/Components/TabSystem.css';

const TabSystem = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="tab-container">
            <div className="tab-headers">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.label}
                        onClick={() => setActiveTab(index)}
                        className={`tab-btn${activeTab === index ? ' tab-btn--active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs[activeTab].content}
            </div>
        </div>
    );
};

export default TabSystem;
