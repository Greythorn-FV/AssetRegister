import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search by registration or contract number..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };
  
  return (
    <form onSubmit={handleSearch} style={styles.container}>
      <div style={styles.inputWrapper}>
        <Search size={20} color="#A0AEC0" style={styles.searchIcon} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          style={styles.input}
        />
        {searchTerm && (
          <button type="button" onClick={handleClear} style={styles.clearButton}>
            <X size={18} color="#A0AEC0" />
          </button>
        )}
      </div>
      <button type="submit" style={styles.searchButton}>
        Search
      </button>
    </form>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '600px'
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '12px 40px 12px 40px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  clearButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  searchButton: {
    padding: '12px 24px',
    background: '#3182CE',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default SearchBar;