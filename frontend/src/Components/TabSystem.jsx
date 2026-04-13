import React, { useState } from "react";

/*
 * Goal: Modular tab container that stores both reviews and lists 
 * The idea is to allow the user to click the tab at the top of the container
 * to quickly switch between reviews and lists. 
 */


const TabSystem = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="tab-container" style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
            <div className="tab-headers" style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
                {tabs.map((tab, index) => (
                    <button 
                        key={tab.label}
                        onClick={() => setActiveTab(index)}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            background: activeTab === index ? '#f0f0f0' : 'transparent',
                            border: 'none',
                            fontWeight: activeTab === index ? 'bold' : 'normal',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content" style={{ padding: '20px' }}>
                {tabs[activeTab].content}
            </div>
        </div>
    );
};
export default TabSystem;