# 实验知识库

教材实验查询工具，用于检索初高中理科教材中的实验数据。

## 功能

- **关键词搜索**：基于 Fuse.js 模糊匹配，支持按字段筛选（全部 / 实验名称 / 实验器材 / 探究知识 / 实验目的）
- **多维度筛选**：版本、学科、年级、实验类型四个维度，计数随搜索和筛选条件动态更新
- **实验详情**：展开查看实验步骤、器材、材料、探究知识、注意事项、出处

## 数据

当前收录人教版生物 66 条实验，覆盖七年级至高中选择性必修三。

数据来源于教材"实验·探究"栏目，字段定义见 [experiment_schema.json](https://github.com/liuguangyu-baike/experiment-knowledge-base/blob/main/data/bio_experiments.json)。

## 技术栈

- 原生 HTML / CSS / JavaScript，无框架依赖
- [Fuse.js 7](https://www.fusejs.io/) 提供模糊搜索
- 纯静态站点，可直接部署到 Netlify / Vercel / GitHub Pages

## 本地运行

```bash
# 任选一种方式启动静态服务器
npx serve .
# 或
python3 -m http.server 3456
```

然后访问 http://localhost:3456

## 扩展

新增学科数据时，将 JSON 文件放入 `data/` 目录，并在 `js/data.js` 的 `DATA_FILES` 数组中添加路径即可。
