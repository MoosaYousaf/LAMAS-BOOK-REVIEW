// TabSystem — a generic tab container used on the Profile page to switch between
// sections (e.g. "Reviews", "Shelves", "Activity").
//
// Props:
//   tabs — array of { label: string, content: ReactNode }
//          Each object provides the tab button text and the content to render
//          when that tab is active.

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
