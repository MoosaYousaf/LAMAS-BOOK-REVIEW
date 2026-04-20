import React, { useState } from "react";

/*
 * Goal: Modular tab container that stores both reviews and lists 
 * The idea is to allow the user to click the tab at the top of the container
 * to quickly switch between reviews and lists. 
 */


const TabSystem = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="tab-container" style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            width: '100%',
            overflow: 'hidden', // NEW: Contain all children
            boxSizing: 'border-box'
        }}>
            <div className="tab-headers" style={{ 
                display: 'flex', 
                borderBottom: '1px solid #ddd',
                overflowX: 'auto', // NEW: Allow tab buttons to scroll if screen is very narrow
                backgroundColor: '#fff'
            }}>
                {tabs.map((tab, index) => (
                    <button 
                        key={tab.label}
                        onClick={() => setActiveTab(index)}
                        style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            background: activeTab === index ? '#f9f9f9' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === index ? '2px solid #333' : '2px solid transparent',
                            fontWeight: activeTab === index ? 'bold' : 'normal',
                            whiteSpace: 'nowrap' // NEW: Keep labels on one line
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content" style={{ 
                padding: '20px',
                boxSizing: 'border-box', // NEW: Padding included in width
                width: '100%'
            }}>
                {tabs[activeTab].content}
            </div>
        </div>
    );
};
export default TabSystem;


/*

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
*/