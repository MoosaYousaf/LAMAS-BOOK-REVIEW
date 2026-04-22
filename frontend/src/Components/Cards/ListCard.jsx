// ListCard — lightweight stub for displaying a named list with a book count.
// This is a placeholder component; it is not currently wired to any page.
// Replace the inline styles with CSS classes if this component is ever put into active use.

const ListCard = ({ list }) => (
    <div className="list-card" style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0'}}>
        <strong>{list.name}</strong> ({ list.books.length } books)
    </div>
);

export default ListCard;
