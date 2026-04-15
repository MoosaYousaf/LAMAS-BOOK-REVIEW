const ListCard = ({ list }) => (
    <div className="list-card" style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0'}}>
        <strong>{list.name}</strong> ({ list.books.length } books)
    </div>
);

export default ListCard;