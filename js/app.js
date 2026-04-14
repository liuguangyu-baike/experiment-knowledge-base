/**
 * 主控逻辑：状态管理、搜索防抖、事件绑定
 */

const appState = {
  filters: {
    publishers: [],
    subjects: [],
    grades: [],
    types: [],
    searchQuery: '',
    searchField: 'all',
  },
};

let debounceTimer = null;

function updateResults() {
  const results = filterExperiments(appState.filters);
  renderResults(results);
  updateFilterCounts();
}

function handleSearchInput(value) {
  appState.filters.searchQuery = value;

  const clearBtn = document.getElementById('clear-search');
  clearBtn.style.display = value ? 'block' : 'none';

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateResults();
  }, 300);
}

function initApp() {
  initFilters();
  updateResults();

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    handleSearchInput(e.target.value);
  });

  document.getElementById('search-field').addEventListener('change', (e) => {
    appState.filters.searchField = e.target.value;
    if (appState.filters.searchQuery) {
      updateResults();
    }
  });

  document.getElementById('clear-search').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    handleSearchInput('');
    searchInput.focus();
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    clearAllFilters();
  });
}

document.addEventListener('dataLoaded', () => {
  initApp();
});
