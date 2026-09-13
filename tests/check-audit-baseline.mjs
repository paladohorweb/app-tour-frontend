import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const baseline = JSON.parse(
  readFileSync(new URL('./audit-baseline.json', import.meta.url), 'utf8'),
);

const audit = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['audit', '--omit=dev', '--json'],
  { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
);

if (!audit.stdout.trim()) {
  console.error(audit.stderr || 'npm audit did not return a JSON report.');
  process.exit(1);
}

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error('Could not parse the npm audit report.');
  console.error(audit.stderr);
  process.exit(1);
}

const failures = [];
const observedAdvisories = new Set();

for (const [packageName, vulnerability] of Object.entries(report.vulnerabilities ?? {})) {
  const allowedSeverity = baseline.packages[packageName];
  if (!allowedSeverity) {
    failures.push(`New vulnerable production package: ${packageName} (${vulnerability.severity}).`);
  } else if (severityRank[vulnerability.severity] > severityRank[allowedSeverity]) {
    failures.push(
      `Severity increased for ${packageName}: ${allowedSeverity} -> ${vulnerability.severity}.`,
    );
  }

  for (const via of vulnerability.via ?? []) {
    if (typeof via === 'string') continue;
    const advisoryId = String(via.source);
    observedAdvisories.add(advisoryId);
    const allowedAdvisorySeverity = baseline.advisories[advisoryId];
    if (!allowedAdvisorySeverity) {
      failures.push(`New advisory ${advisoryId}: ${via.title} (${via.severity}).`);
    } else if (severityRank[via.severity] > severityRank[allowedAdvisorySeverity]) {
      failures.push(
        `Severity increased for advisory ${advisoryId}: ${allowedAdvisorySeverity} -> ${via.severity}.`,
      );
    }
  }
}

const totals = report.metadata?.vulnerabilities ?? {};
console.log(
  `Production audit: ${totals.total ?? 0} known findings ` +
    `(${totals.critical ?? 0} critical, ${totals.high ?? 0} high, ` +
    `${totals.moderate ?? 0} moderate, ${totals.low ?? 0} low).`,
);
console.log(
  `Checked ${observedAdvisories.size} advisories against the Angular 17 baseline from ${baseline.documentedAt}.`,
);

if (failures.length) {
  console.error('\nSecurity baseline failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('No new production vulnerability or severity increase was detected.');
