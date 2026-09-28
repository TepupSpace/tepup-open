/**
 * Fix broken image URLs in LessonContent blocks.
 *
 * Problems found:
 * 1. Nicolas_de_Condorcet.PNG — wrong hash (0/0c → 5/5b)
 * 2. Trias_Politica_en.svg   — file deleted on Wikimedia → replace with Trias-politica.png
 * 3. Checks_and_Balances.svg — file deleted on Wikimedia → replace with Separation_of_powers.png
 * 4. ElectoralCollege2024.svg — wrong hash (4/4a → f/f7)
 *
 * Run: cd tepup && npx tsx scripts/fix-image-urls.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

const URL_FIXES: Record<string, string> = {
  'https://upload.wikimedia.org/wikipedia/commons/0/0c/Nicolas_de_Condorcet.PNG':
    'https://upload.wikimedia.org/wikipedia/commons/5/5b/Nicolas_de_Condorcet.PNG',
  'https://upload.wikimedia.org/wikipedia/commons/4/40/Trias_Politica_en.svg':
    'https://upload.wikimedia.org/wikipedia/commons/e/e8/Trias-politica.png',
  'https://upload.wikimedia.org/wikipedia/commons/b/bd/Checks_and_Balances.svg':
    'https://upload.wikimedia.org/wikipedia/commons/2/29/Separation_of_powers.png',
  'https://upload.wikimedia.org/wikipedia/commons/4/4a/ElectoralCollege2024.svg':
    'https://upload.wikimedia.org/wikipedia/commons/f/f7/ElectoralCollege2024.svg',
};

async function main() {
  const contents = await prisma.lessonContent.findMany({
    select: { lessonId: true, blocks: true },
  });

  let updatedCount = 0;

  for (const content of contents) {
    const blocks = content.blocks as { type: string; src?: string; [key: string]: unknown }[];
    let changed = false;

    const updatedBlocks = blocks.map(block => {
      if (block.type !== 'image' || !block.src) return block;
      const fixedSrc = URL_FIXES[block.src];
      if (fixedSrc) {
        console.log(`  ✅ Fix: ${block.src.split('/').slice(-1)[0]}`);
        console.log(`      → ${fixedSrc.split('/').slice(-1)[0]}`);
        changed = true;
        return { ...block, src: fixedSrc };
      }
      return block;
    });

    if (changed) {
      await prisma.lessonContent.update({
        where: { lessonId: content.lessonId },
        data: { blocks: updatedBlocks as object[] },
      });
      updatedCount++;
      console.log(`  Saved lessonId: ${content.lessonId}\n`);
    }
  }

  console.log(`\nDone. Updated ${updatedCount} lesson(s).`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
