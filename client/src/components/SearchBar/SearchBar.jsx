import "./SearchBar.css";

function SearchBar() {
  return (
    <div className="searchBar">

      <input
        type="text"
        placeholder="Describe your problem..."
      />

      <button>

        Search

      </button>

    </div>
  );
}

export default SearchBar;