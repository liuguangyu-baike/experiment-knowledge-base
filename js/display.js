/**
 * 实验卡片渲染与详情展开/折叠
 */

const TYPE_TAG_CLASS = {
  '观察/探索': 'tag-type-observe',
  '调参/验证': 'tag-type-verify',
  '技能训练': 'tag-type-skill',
  '工程/制作': 'tag-type-engineer',
};

function renderResults(experiments) {
  const list = document.getElementById('results-list');
  const noResults = document.getElementById('no-results');
  const countEl = document.getElementById('results-count');

  if (experiments.length === 0) {
    list.innerHTML = '';
    noResults.style.display = 'block';
    countEl.textContent = '共 0 条实验';
    return;
  }

  noResults.style.display = 'none';
  countEl.textContent = `共 ${experiments.length} 条实验`;

  list.innerHTML = experiments.map(exp => renderCard(exp)).join('');
}

function renderCard(exp) {
  const typeClass = TYPE_TAG_CLASS[exp.type] || '';
  const sourceText = formatSource(exp.source);

  return `
    <div class="experiment-card" data-id="${exp.id}">
      <div class="card-tags">
        <span class="tag tag-publisher">${esc(exp.publisher)}</span>
        <span class="tag tag-grade">${esc(exp.grade)}</span>
        <span class="tag ${typeClass}">${esc(exp.type)}</span>
      </div>
      <div class="card-name">${esc(exp.name)}</div>
      <div class="card-purpose">${esc(exp.purpose)}</div>
      <button class="toggle-detail-btn" onclick="toggleDetail(this)">
        <span class="toggle-arrow">▶</span> 展开详情
      </button>
      <div class="card-detail">
        ${renderDetailSection('实验器材', renderTagList(exp.equipment))}
        ${renderDetailSection('实验材料', renderTagList(exp.materials))}
        ${renderDetailSection('实验步骤', renderSteps(exp.steps))}
        ${renderDetailSection('探究知识', renderBulletList(exp.inquiry_skills))}
        ${renderDetailSection('注意事项', renderBulletList(exp.cautions))}
        ${renderDetailSection('出处', `<div class="detail-source">${esc(sourceText)}</div>`)}
      </div>
    </div>
  `;
}

function toggleDetail(btn) {
  const card = btn.closest('.experiment-card');
  const detail = card.querySelector('.card-detail');
  const arrow = btn.querySelector('.toggle-arrow');

  const isOpen = detail.classList.toggle('open');
  arrow.classList.toggle('expanded', isOpen);
  btn.childNodes[btn.childNodes.length - 1].textContent = isOpen ? ' 收起详情' : ' 展开详情';
}

function renderDetailSection(label, contentHtml) {
  if (!contentHtml || contentHtml.trim() === '') return '';
  return `
    <div class="detail-section">
      <div class="detail-label">${label}</div>
      <div class="detail-value">${contentHtml}</div>
    </div>
  `;
}

function renderTagList(arr) {
  if (!arr || arr.length === 0) return '';
  return `<div class="tag-list">${arr.map(v => `<span class="tag-item">${esc(v)}</span>`).join('')}</div>`;
}

function renderBulletList(arr) {
  if (!arr || arr.length === 0) return '';
  return `<ul class="detail-list">${arr.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`;
}

function renderSteps(steps) {
  if (!steps || steps.length === 0) return '';
  return `<ul class="steps-list">${steps.map(s => {
    let html = `<li><strong>${esc(s.step)}</strong>`;
    if (s.substeps && s.substeps.length > 0) {
      html += `<ul class="substeps-list">${s.substeps.map(ss => `<li>${esc(ss)}</li>`).join('')}</ul>`;
    }
    html += '</li>';
    return html;
  }).join('')}</ul>`;
}

function formatSource(source) {
  if (!source) return '';
  const parts = [];
  if (source.textbook) parts.push(source.textbook);
  if (source.chapter) parts.push(`第${source.chapter}节`);
  if (source.pages && source.pages.length > 0) {
    parts.push(`P${source.pages.join('-')}`);
  }
  return parts.join(' · ');
}

function esc(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}
