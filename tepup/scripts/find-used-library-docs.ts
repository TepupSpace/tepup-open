/**
 * Find which LibraryDocuments are referenced in LessonContent and ChapterContent blocks
 */
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    const lessonContents = (await client.query(`SELECT id, title, blocks FROM "LessonContent"`)).rows;
    const chapterContents = (await client.query(`SELECT id, title, blocks FROM "ChapterContent"`)).rows;

    const referencedIds = new Set<string>();
    const referencedSlugs = new Set<string>();

    function scanBlocks(blocks: any[], source: string) {
      for (const block of blocks) {
        if (block.type === 'library-document') {
          console.log(`  [${source}] library-document block:`, JSON.stringify(block).substring(0, 200));
          if (block.slug) referencedSlugs.add(block.slug);
          if (block.documentId) referencedIds.add(block.documentId);
          if (block.id) referencedIds.add(block.id);
          if (block.documentSlug) referencedSlugs.add(block.documentSlug);
        }
      }
    }

    console.log('\n=== Scanning LessonContents ===');
    for (const lc of lessonContents) {
      const blocks = typeof lc.blocks === 'string' ? JSON.parse(lc.blocks) : lc.blocks;
      scanBlocks(blocks, lc.title);
    }

    console.log('\n=== Scanning ChapterContents ===');
    for (const cc of chapterContents) {
      const blocks = typeof cc.blocks === 'string' ? JSON.parse(cc.blocks) : cc.blocks;
      scanBlocks(blocks, cc.title);
    }

    console.log(`\n=== Referenced IDs: ${referencedIds.size}, Slugs: ${referencedSlugs.size} ===`);
    for (const id of referencedIds) console.log(`  ID: ${id}`);
    for (const slug of referencedSlugs) console.log(`  Slug: ${slug}`);

    // Also list all library docs in DB for reference
    const allDocs = (await client.query(`SELECT id, slug, title FROM "LibraryDocument" ORDER BY "sortOrder"`)).rows;
    console.log(`\n=== All LibraryDocuments in staging (${allDocs.length}) ===`);
    for (const doc of allDocs) {
      console.log(`  ${doc.slug}: "${doc.title}" (${doc.id})`);
    }

    // Match by ID
    if (referencedIds.size > 0) {
      const docs = (await client.query(
        `SELECT * FROM "LibraryDocument" WHERE id = ANY($1) ORDER BY "sortOrder"`,
        [Array.from(referencedIds)]
      )).rows;
      console.log(`\n=== Matched by ID (${docs.length}) ===`);
      for (const doc of docs) console.log(`  ✅ ${doc.slug}: "${doc.title}"`);
    }

    // Export all referenced docs
    const allRefIds = new Set([...referencedIds]);
    // Also try matching slugs
    if (referencedSlugs.size > 0) {
      const docs = (await client.query(
        `SELECT * FROM "LibraryDocument" WHERE slug = ANY($1)`,
        [Array.from(referencedSlugs)]
      )).rows;
      for (const d of docs) allRefIds.add(d.id);
    }

    if (allRefIds.size > 0) {
      const docs = (await client.query(
        `SELECT * FROM "LibraryDocument" WHERE id = ANY($1) ORDER BY "sortOrder"`,
        [Array.from(allRefIds)]
      )).rows;

      const fs = await import('fs');
      fs.writeFileSync(
        '/Users/macbookpro/Desktop/Dev Projects/Project - Tepup/tepup/scripts/library-docs-export.json',
        JSON.stringify(docs, null, 2)
      );
      console.log(`\n✅ Exported ${docs.length} docs to library-docs-export.json`);
    } else {
      console.log('\n⚠️ No library documents referenced in content blocks');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
