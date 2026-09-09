#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const pagePath = path.resolve(process.cwd(), 'monitor/index.html');
const html = fs.readFileSync(pagePath, 'utf8');
const expectedIds = ['elliot', 'super-manager', 'worklog-insight', 'jmatch-engine'];

const checks = [
  ['canonical URL', /<link rel="canonical" href="https:\/\/writeup-inc\.github\.io\/saas\/monitor\/">/],
  ['noindex policy', /<meta name="robots" content="noindex, nofollow">/],
  ['initial fee disclosure', /初期費用[\s\S]{0,180}0円/],
  ['monthly fee disclosure', /月額料金[\s\S]{0,180}0円/],
  ['API actual-cost disclosure', /API利用料などの実費のみ/],
  ['pre-start agreement', /開始前に書面で確認/],
  ['post-monitor terms', /継続は自動ではありません/],
  ['data handling', /データの取り扱い/],
  ['reduced motion', /prefers-reduced-motion:\s*reduce/],
  ['1200px content width', /1200px/],
  ['filter controls', /class="filter-button"/],
  ['share controls', /data-share=/],
  ['contact route', /https:\/\/www\.writeup\.jp\/contact\//],
];

const validate = (source) => {
  const failures = checks.filter(([, pattern]) => !pattern.test(source));
  const cards = [...source.matchAll(/<article class="service-card" id="([^"]+)" data-category="([^"]+)">/g)];
  const ids = cards.map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (cards.length < 4) failures.push(['at least four monitor cards']);
  if (ids.join(',') !== expectedIds.join(',')) failures.push(['expected monitor service lineup']);
  if (duplicateIds.length) failures.push([`unique card ids (${[...new Set(duplicateIds)].join(', ')})`]);

  for (const id of ids) {
    if (!new RegExp(`data-share="${id}"`).test(source)) {
      failures.push([`share anchor for ${id}`]);
    }
  }

  return { failures, cards, ids };
};

if (process.argv.includes('--self-test')) {
  const cases = [
    ['API disclosure removed', html.replaceAll('API利用料などの実費のみ', '実費をご負担'), 'API actual-cost disclosure'],
    ['share anchor removed', html.replace('data-share="elliot"', 'data-share="missing"'), 'share anchor for elliot'],
  ];

  for (const [label, source, expected] of cases) {
    const detected = validate(source).failures.some(([failure]) => failure === expected);
    if (!detected) {
      console.error(`SELF-TEST FAIL: ${label}`);
      process.exit(1);
    }
    console.log(`SELF-TEST PASS: ${label}`);
  }
}

const { failures, cards, ids } = validate(html);

if (failures.length) {
  console.error('Monitor page checks failed:');
  for (const [label] of failures) console.error(`- ${label}`);
  process.exit(1);
}

console.log(`Monitor page checks passed: ${checks.length + 3 + ids.length} assertions, ${cards.length} service cards.`);
