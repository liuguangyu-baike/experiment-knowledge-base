/**
 * 数据加载、Fuse.js 搜索索引、筛选逻辑
 */

const experimentStore = {
  allExperiments: [],
  searchIndices: {},
};

const SEARCH_FIELD_CONFIGS = {
  all: [
    { name: 'name', weight: 2 },
    { name: 'purpose', weight: 1.5 },
    { name: 'inquiry_skills', weight: 1 },
    { name: 'equipment', weight: 0.8 },
    { name: 'materials', weight: 0.8 },
  ],
  name:           [{ name: 'name', weight: 1 }],
  equipment:      [{ name: 'equipment', weight: 1 }],
  inquiry_skills: [{ name: 'inquiry_skills', weight: 1 }],
  purpose:        [{ name: 'purpose', weight: 1 }],
};

const DATA_FILES = [
  'data/bio_experiments.json',
];

async function loadData() {
  try {
    const responses = await Promise.all(DATA_FILES.map(f => fetch(f)));
    const datasets = await Promise.all(responses.map(r => {
      if (!r.ok) throw new Error(`加载失败: ${r.url}`);
      return r.json();
    }));

    experimentStore.allExperiments = datasets.flat();

    if (typeof Fuse !== 'undefined') {
      const fuseOptions = { threshold: 0.35, includeScore: true, ignoreLocation: true };
      for (const [field, keys] of Object.entries(SEARCH_FIELD_CONFIGS)) {
        experimentStore.searchIndices[field] = new Fuse(
          experimentStore.allExperiments,
          { ...fuseOptions, keys }
        );
      }
    }

    document.dispatchEvent(new CustomEvent('dataLoaded', {
      detail: experimentStore
    }));
  } catch (err) {
    console.error('数据加载失败:', err);
    document.getElementById('results-count').textContent = '数据加载失败，请刷新重试';
  }
}

function searchExperiments(query, field) {
  field = field || 'all';
  const index = experimentStore.searchIndices[field];
  if (!index || !query.trim()) return [];
  return index.search(query).map(r => r.item);
}

/**
 * 筛选实验，可选择性跳过某个维度（用于计算该维度的动态计数）
 */
function filterExperiments(filters, skipDimension) {
  let results = experimentStore.allExperiments;

  if (skipDimension !== 'publishers' && filters.publishers && filters.publishers.length > 0) {
    results = results.filter(e => filters.publishers.includes(e.publisher));
  }

  if (skipDimension !== 'subjects' && filters.subjects && filters.subjects.length > 0) {
    results = results.filter(e => filters.subjects.includes(e.subject));
  }

  if (skipDimension !== 'grades' && filters.grades && filters.grades.length > 0) {
    const gradeSet = new Set(filters.grades);
    results = results.filter(e => gradeSet.has(e.grade));
  }

  if (skipDimension !== 'types' && filters.types && filters.types.length > 0) {
    results = results.filter(e => filters.types.includes(e.type));
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    const searchResults = searchExperiments(filters.searchQuery, filters.searchField);
    const searchIds = new Set(searchResults.map(e => e.id));
    results = results.filter(e => searchIds.has(e.id));
  }

  return results;
}

function getUniqueValues(field) {
  const values = new Set();
  experimentStore.allExperiments.forEach(e => {
    if (e[field]) values.add(e[field]);
  });
  return [...values];
}

document.addEventListener('DOMContentLoaded', loadData);
