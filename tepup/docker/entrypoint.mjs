// Container start for the local Docker stack (compose.yaml): wait for the database, push
// the schema as the owner, lock it down like production, seed demo content, build, serve.
// Local only: it refuses to run unless it is pointed at the compose `db` service.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import pg from 'pg';

const owner = process.env.DIRECT_URL;
if (process.env.TEPUP_LOCAL_DOCKER !== '1' || !owner || new URL(owner).hostname !== 'db') {
  console.error('docker/entrypoint.mjs only runs inside the local Docker stack (compose.yaml).');
  process.exit(1);
}

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function waitForDb() {
  for (let i = 0; i < 60; i++) {
    const client = new pg.Client({ connectionString: owner });
    try {
      await client.connect();
      await client.end();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.error('The local database did not come up.');
  process.exit(1);
}

await waitForDb();

// prisma.config.ts prefers DIRECT_URL, so this runs as the owner. `db push` is fine here:
// the local database is disposable. Live databases get reviewed SQL (prisma/sql/), never this.
run('npx', ['prisma', 'db', 'push', '--accept-data-loss']);

const client = new pg.Client({ connectionString: owner });
await client.connect();
await client.query(readFileSync('docker/after-push.sql', 'utf8'));
await client.end();

run('npx', ['tsx', 'scripts/docker-seed.ts', '--apply']);
run('npm', ['run', 'build']);

console.log(`\nTepup is up on http://localhost:${process.env.TEPUP_PORT || 3000} (admin / LOCAL_ADMIN_PASSWORD)\n`);
const server = spawnSync('npx', ['next', 'start', '-p', '3000', '-H', '0.0.0.0'], { stdio: 'inherit' });
process.exit(server.status ?? 0);
