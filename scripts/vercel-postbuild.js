const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcHtml = path.join(root, 'dist', 'client', 'client', 'index.html');
const outHtml = path.join(root, 'dist', 'client', 'index.html');

if (!fs.existsSync(srcHtml)) {
  console.error('未找到构建入口文件:', srcHtml);
  process.exit(1);
}

let html = fs.readFileSync(srcHtml, 'utf8');

const replacements = [
  ['{{{appAvatar}}}', ''],
  ['{{{__platform__}}}', ''],
  ['{{appId}}', ''],
  ['{{userId}}', ''],
  ['{{tenantId}}', ''],
  ['{{userName}}', ''],
  ['{{csrfToken}}', ''],
  ['{{environment}}', 'production'],
  ['{{basename}}', ''],
  ['{{appName}}', '智能任务管理系统'],
  ['{{appDescription}}', '按优先级管理你的每日任务'],
  ['{{appAvatar}}', ''],
];

for (const [from, to] of replacements) {
  html = html.split(from).join(to);
}

fs.writeFileSync(outHtml, html, 'utf8');
console.log('已生成静态入口:', outHtml);
