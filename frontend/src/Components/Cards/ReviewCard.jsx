const ReviewCard = ({ review }) => (
    <div className="review-card" style={{ marginBottom: '15px', borderBottom: '1px solid #eee'}}>
        <h4>{review.title}</h4>
        <p>{review.rating}</p>
        <p>{review.comment}</p>
    </div>
);

export default ReviewCard;