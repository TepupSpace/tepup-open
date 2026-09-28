/**
 * Upload the B01 illustrations to the target project's Supabase Storage.
 *
 * The two SVGs in ./assets are authored in-repo (flat vector, Vietnamese labels,
 * palette xanh-cam-trắng) to the illustration prompts in final.md. Keeping the
 * source in git means they can be edited and re-uploaded, unlike a binary drop.
 *
 *   npx tsx scripts/logic-101/upload-images.ts --env=.env
 *   npx tsx scripts/logic-101/upload-images.ts --env='tepup-(.env)/.env.production'
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the given env file.
 * Prints the public URLs to paste into ./images.ts.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'course_images';

const ASSETS = [
  { key: 'B01.hero', file: 'b01-hero.svg', name: 'logic-101/b01-confirmation-bias-hero.svg' },
  { key: 'B01.loopDiagram', file: 'b01-loop-diagram.svg', name: 'logic-101/b01-vong-lap-3-giai-doan.svg' },
  { key: 'B02.hero', file: 'b02-hero.svg', name: 'logic-101/b02-nguy-bien-hero.svg' },
  { key: 'B02.bridgeDiagram', file: 'b02-bridge-diagram.svg', name: 'logic-101/b02-so-do-cay-cau.svg' },
];

async function main() {
  const envArg = process.argv.find((a) => a.startsWith('--env='));
  if (!envArg) {
    console.error('ERROR: --env=<path to env file> is required.');
    process.exit(1);
  }
  const envPath = envArg.slice('--env='.length);
  const parsed = dotenv.config({ path: envPath, override: true }).parsed ?? {};

  const url = parsed.SUPABASE_URL;
  const key = parsed.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('');
    console.error(`ERROR: ${envPath} is missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.`);
    console.error('');
    console.error('Get them one of two ways:');
    console.error('  A) npx vercel login && npx vercel env pull ' + envPath + ' --environment=production');
    console.error('  B) Supabase dashboard → Settings → API → Project URL + service_role key,');
    console.error('     then append to ' + envPath + ':');
    console.error('       SUPABASE_URL="https://<ref>.supabase.co"');
    console.error('       SUPABASE_SERVICE_ROLE_KEY="<service_role key>"');
    process.exit(1);
  }

  console.log(`\nTarget Supabase: ${url}`);
  const supabase = createClient(url, key);

  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (!bucket) {
    console.log(`Creating public bucket "${BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`createBucket failed: ${error.message}`);
  } else {
    console.log(`Bucket "${BUCKET}" exists.`);
  }

  const results: Record<string, string> = {};

  for (const asset of ASSETS) {
    const filePath = path.join(__dirname, 'assets', asset.file);
    const body = fs.readFileSync(filePath);

    const { error } = await supabase.storage.from(BUCKET).upload(asset.name, body, {
      contentType: 'image/svg+xml',
      upsert: true,
      cacheControl: '31536000',
    });
    if (error) throw new Error(`upload ${asset.name} failed: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(asset.name);
    results[asset.key] = data.publicUrl;
    console.log(`  uploaded  ${asset.file}  (${(body.length / 1024).toFixed(1)} KB)`);
  }

  // images.ts builds these URLs from a shared BUCKET_BASE, so nothing normally needs
  // pasting — this is a cross-check that the built URLs match what was actually stored.
  console.log('\n─── public URLs (should match scripts/logic-101/images.ts) ───\n');
  for (const [k, v] of Object.entries(results)) console.log(`  ${k.padEnd(20)} ${v}`);
  console.log('');
}

main().catch((e) => {
  console.error('\nFAILED:', e.message ?? e);
  process.exit(1);
});
