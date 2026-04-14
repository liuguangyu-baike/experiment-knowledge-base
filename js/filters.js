/**
 * 左侧筛选面板：版本、学科、年级、实验类型
 * 计数根据当前搜索和其他筛选条件动态更新
 */

const GRADE_FILTER_CONFIG = [
  { label: '七年级上', values: ['七年级上'] },
  { label: '七年级下', values: ['七年级下'] },
  { label: '八年级上', values: ['八年级上'] },
  { label: '八年级下', values: ['八年级下'] },
  { label: '九年级',   values: ['九年级', '九年级上', '九年级下'] },
  { label: '必修一',   values: ['高中必修1'] },
  { label: '必修二',   values: ['高中必修2'] },
  { label: '选修一',   values: ['高中选择性必修1'] },
  { label: '选修二',   values: ['高中选择性必修2'] },
  { label: '选修三',   values: ['高中选择性必修3'] },
];

const FILTER_DIMENSIONS = [
  { key: 'publisher', title: '版本',     stateKey: 'publishers' },
  { key: 'subject',   title: '学科',     stateKey: 'subjects' },
  { key: 'grade',     title: '年级',     stateKey: 'grades' },
  { key: 'type',      title: '实验类型', stateKey: 'types' },
];

function initFilters() {
  const container = document.getElementById('filter-groups');
  container.innerHTML = '';

  FILTER_DIMENSIONS.forEach(dim => {
    const group = document.createElement('div');
    group.className = 'filter-group';
    group.dataset.dimension = dim.stateKey;

    const title = document.createElement('div');
    title.className = 'filter-group-title';
    title.textContent = dim.title;
    group.appendChild(title);

    if (dim.key === 'grade') {
      renderGradeFilters(group);
    } else {
      renderSimpleFilters(group, dim);
    }

    container.appendChild(group);
  });
}

function renderSimpleFilters(group, dim) {
  const values = getUniqueValues(dim.key).sort();
  values.forEach(val => {
    const label = createFilterOption(val, val, 0, (checked) => {
      handleFilterChange(dim.stateKey, val, checked);
    });
    label.dataset.filterValue = val;
    label.dataset.filterField = dim.key;
    group.appendChild(label);
  });
}

function renderGradeFilters(group) {
  const existingGrades = new Set(getUniqueValues('grade'));

  GRADE_FILTER_CONFIG.forEach(cfg => {
    const hasData = cfg.values.some(v => existingGrades.has(v));
    if (!hasData) return;

    const label = createFilterOption(cfg.label, `grade-${cfg.label}`, 0, (checked) => {
      if (checked) {
        cfg.values.forEach(v => {
          if (!appState.filters.grades.includes(v)) {
            appState.filters.grades.push(v);
          }
        });
      } else {
        cfg.values.forEach(v => {
          const idx = appState.filters.grades.indexOf(v);
          if (idx > -1) appState.filters.grades.splice(idx, 1);
        });
      }
      updateResults();
    });
    label.dataset.gradeValues = JSON.stringify(cfg.values);
    group.appendChild(label);
  });
}

function createFilterOption(text, id, count, onChange) {
  const label = document.createElement('label');
  label.className = 'filter-option';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `filter-${id}`;
  checkbox.addEventListener('change', (e) => onChange(e.target.checked));

  const span = document.createElement('span');
  span.textContent = text;

  const countSpan = document.createElement('span');
  countSpan.className = 'count';
  countSpan.textContent = count;

  label.appendChild(checkbox);
  label.appendChild(span);
  label.appendChild(countSpan);
  return label;
}

/**
 * 更新所有筛选维度的计数
 * 每个维度的计数 = 应用其他所有维度筛选后，该选项能匹配的数量
 */
function updateFilterCounts() {
  FILTER_DIMENSIONS.forEach(dim => {
    const group = document.querySelector(`.filter-group[data-dimension="${dim.stateKey}"]`);
    if (!group) return;

    const baseResults = filterExperiments(appState.filters, dim.stateKey);

    if (dim.key === 'grade') {
      group.querySelectorAll('label[data-grade-values]').forEach(label => {
        const gradeValues = JSON.parse(label.dataset.gradeValues);
        const count = baseResults.filter(e => gradeValues.includes(e.grade)).length;
        label.querySelector('.count').textContent = count;
      });
    } else {
      group.querySelectorAll(`label[data-filter-field="${dim.key}"]`).forEach(label => {
        const val = label.dataset.filterValue;
        const count = baseResults.filter(e => e[dim.key] === val).length;
        label.querySelector('.count').textContent = count;
      });
    }
  });
}

function handleFilterChange(stateKey, value, checked) {
  const arr = appState.filters[stateKey];
  if (checked) {
    if (!arr.includes(value)) arr.push(value);
  } else {
    const idx = arr.indexOf(value);
    if (idx > -1) arr.splice(idx, 1);
  }
  updateResults();
}

function clearAllFilters() {
  appState.filters.publishers = [];
  appState.filters.subjects = [];
  appState.filters.grades = [];
  appState.filters.types = [];

  document.querySelectorAll('#filter-groups input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  updateResults();
}
