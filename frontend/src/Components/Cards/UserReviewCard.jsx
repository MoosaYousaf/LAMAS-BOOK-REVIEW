import '../../Styles/variables.css';
import '../../Styles/Components/UserReviewCard.css';

const UserReviewCard = ({ review, onClick, friendMode, friendData, isBookDetailPage }) => {
    const { Books, review_comment, rating, created_at } = review;

    const truncated = review_comment?.length > 180
        ? review_comment.substring(0, 180) + '...'
        : review_comment;

    return (
        <div className="urc" onClick={() => onClick(review)}>
            <img
                src={Books?.image_url_m || Books?.image_url_l || `https://api.dicebear.com/9.x/initials/svg?seed=book`}
                alt="cover"
                className={isBookDetailPage ? 'urc__pfp' : 'urc__cover'}
                onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=book`; }}
            />

            <div className="urc__body">
                <div className="urc__header-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="urc__title">{Books?.book_title || 'Unknown Title'}</h3>
                        {!isBookDetailPage && (
                            <p className="urc__author">by {Books?.book_author || 'Unknown Author'}</p>
                        )}
                    </div>

                    {friendMode && (
                        <div className="urc__friend-badge">
                            <div className="urc__friend-info">
                                <span className="urc__friend-name">{friendData?.username}</span>
                                <img
                                    src={friendData?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${friendData?.username}`}
                                    className="urc__friend-pfp"
                                    alt="pfp"
                                    onError={(e) => { e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${friendData?.username}`; }}
                                />
                            </div>
                            <span className="urc__date">
                                {new Date(created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    )}
                </div>

                <div className="urc__stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < rating ? 'urc__star--filled' : 'urc__star--empty'}>★</span>
                    ))}
                </div>

                <p className="urc__text">{truncated}</p>
            </div>
        </div>
    );
};

export default UserReviewCard;
