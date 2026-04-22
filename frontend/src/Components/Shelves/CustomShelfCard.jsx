import '../../Styles/variables.css';
import '../../Styles/Components/ShelvesManager.css';

const CustomShelfCard = ({ list, onClick, isOwnProfile }) => {
    if (list.isPlaceholder) {
        return (
            <div onClick={onClick} className="csc csc--placeholder">
                <span className="csc__plus">{isOwnProfile ? '+' : ''}</span>
            </div>
        );
    }

    const previewBooks = list.ListEntries?.slice(0, 3) || [];

    return (
        <div onClick={onClick} className="csc">
            <div>
                <div className="csc__header">
                    <h3 className="csc__name">{list.name}</h3>
                    <span className="csc__count">{list.book_count || 0} books</span>
                </div>
                {list.description && <p className="csc__desc">{list.description}</p>}
            </div>

            <div className="csc__books">
                {previewBooks.map((entry) => {
                    const src = entry.Books?.image_url_m || entry.Books?.image_url_l;
                    return (
                        <div key={entry.isbn} className="csc__book-thumb">
                            {src ? (
                                <img
                                    src={src}
                                    alt={entry.Books?.book_title || ''}
                                    className="csc__book-thumb-img"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <span className="csc__book-thumb-fallback">📖</span>
                            )}
                        </div>
                    );
                })}
                {list.book_count > 3 && (
                    <div className="csc__more">+{list.book_count - 3} more</div>
                )}
            </div>
        </div>
    );
};

export default CustomShelfCard;
