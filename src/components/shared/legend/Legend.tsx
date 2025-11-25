import './legend.css';

interface LegendItem {
    abbreviation: string;
    fullName: string;
}

interface LegendSection {
    title: string;
    items: LegendItem[];
}

interface LegendProps {
    sections: LegendSection[];
}

export default function Legend({ sections }: LegendProps) {
    return (
        <div className='legend-container'>
            <h3 className='legend-title'>Statistics Legend</h3>

            {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className='legend-section'>
                    <h4 className='legend-section-title'>{section.title}</h4>
                    <div className='legend-items'>
                        {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className='legend-item'>
                                <span className='legend-abbr'>{item.abbreviation}</span>
                                <span className='legend-separator'>—</span>
                                <span className='legend-full-name'>{item.fullName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
