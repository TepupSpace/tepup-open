/**
 * Pre-publish check: identifying metadata in files committed to the repo.
 *
 * Run from tepup/:  npx tsx scripts/check-committed-media.ts        (files on HEAD)
 *                   npx tsx scripts/check-committed-media.ts --all  (every blob in history)
 * Exits 1 if anything is found, so it can gate a release or CI job.
 *
 * Flags:
 *  - images with EXIF (esp. GPS), XMP or IPTC blocks
 *  - PDFs with an Author/Creator/Subject/Keywords entry or an XMP packet, or local file paths
 *  - Office files (docx/xlsx/pptx), always, for a manual creator/lastModifiedBy check
 *  - SVGs with script, event handlers or editor metadata
 *  - any file containing a local home-directory path
 *
 * Fix images with `exiftool -all= -overwrite_original <file>` (or ExifCleaner), or re-export.
 * PDFs: note that `exiftool -all=` on a PDF is reversible (it appends an incremental update);
 * rewrite the file afterwards with `qpdf --linearize in.pdf out.pdf`, or re-export it.
 * This checks METADATA only — it cannot tell whether the visible content identifies anyone.
 */
import { execFileSync } from 'child_process';
import sharp from 'sharp';

const all = process.argv.includes('--all');
// Always run from the repository root, so paths and `ls-tree` cover the whole repo.
const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel']).toString().trim();
const git = (...args: string[]) => execFileSync('git', ['-C', ROOT, ...args], { maxBuffer: 1 << 30 });

const IMAGE = /\.(jpe?g|png|webp|gif|tiff?|avif|heic)$/i;
const CHECKED = /\.(jpe?g|png|webp|gif|tiff?|avif|heic|svg|pdf|docx|xlsx|pptx)$/i;
const HOME_PATH = /(?:[A-Z]:\\\\?Users\\\\?[A-Za-z0-9._-]+|\/Users\/[A-Za-z0-9._-]+|\/home\/[a-z0-9._-]+)/;

function listBlobs(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const lines = all
    ? git('rev-list', '--all', '--objects').toString().split('\n')
    : git('ls-tree', '-r', 'HEAD', '--format=%(objectname) %(path)').toString().split('\n');
  for (const line of lines) {
    const i = line.indexOf(' ');
    if (i < 0) continue;
    const [blob, path] = [line.slice(0, i), line.slice(i + 1)];
    if (!CHECKED.test(path)) continue;
    map.set(blob, [...(map.get(blob) ?? []), path]);
  }
  return map;
}

async function check(path: string, buf: Buffer): Promise<string[]> {
  const issues: string[] = [];
  const latin = buf.toString('latin1');
  if (IMAGE.test(path)) {
    try {
      const m = await sharp(buf).metadata();
      const exif = m.exif?.toString('latin1') ?? '';
      if (m.exif) issues.push(exif.includes('\x25\x88') || exif.includes('\x88\x25') ? 'EXIF with GPS' : 'EXIF');
      if (m.xmp) issues.push('XMP');
      if (m.iptc) issues.push('IPTC');
    } catch {
      issues.push('unreadable image');
    }
  } else if (/\.svg$/i.test(path)) {
    if (/<script|\son[a-z]+\s*=/i.test(latin)) issues.push('SVG script/event handler');
    if (/inkscape:|sodipodi:|<metadata[\s>]/i.test(latin)) issues.push('SVG editor metadata');
  } else if (/\.pdf$/i.test(path)) {
    for (const key of ['Author', 'Creator', 'Subject', 'Keywords']) {
      const m = latin.match(new RegExp(`/${key}\\s*(\\((?:\\\\.|[^\\\\)])*\\)|<[0-9A-Fa-f]+>)`));
      if (m && m[1].length > 2) issues.push(`PDF /${key}`);
    }
    if (latin.includes('<x:xmpmeta')) issues.push('PDF XMP packet');
  } else if (/\.(docx|xlsx|pptx)$/i.test(path)) {
    // Office files are zip archives whose docProps/core.xml holds creator/lastModifiedBy;
    // not parsed here (no zip dependency). Inspect with exiftool or strip before committing.
    issues.push('Office file: check creator/lastModifiedBy manually');
  }
  const home = latin.match(HOME_PATH);
  if (home) issues.push(`local path "${home[0]}"`);
  return issues;
}

async function main() {
  const blobs = listBlobs();
  const head = new Set(git('ls-files').toString().split('\n'));
  let found = 0;
  for (const [blob, paths] of blobs) {
    const issues = await check(paths[0], git('cat-file', 'blob', blob));
    if (!issues.length) continue;
    found++;
    const where = paths.some((p) => head.has(p)) ? 'HEAD   ' : 'history';
    console.log(`${where}  ${paths[0]}${paths.length > 1 ? ` (+${paths.length - 1} paths)` : ''}: ${issues.join(', ')}`);
  }
  console.log(`\nchecked ${blobs.size} file(s) ${all ? 'across all history' : 'on HEAD'}: ${found ? `${found} with metadata` : 'clean'}`);
  process.exit(found ? 1 : 0);
}

main();
