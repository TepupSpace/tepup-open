/**
 * Fix 6 broken image URLs found in LessonContent blocks.
 *
 * Issues:
 * 1. Map_of_unitary_and_federal_states.svg — wrong hash (0/08 → 4/46)
 * 2. Alexis_de_Tocqueville photo — file deleted → replacement (Chassériau portrait)
 * 3. US_2016_presidential_election_by_county.svg — file deleted → replacement
 * 4. France_2002_presidential_election_second_round.svg — file deleted → replacement
 * 5. Suffragette_City_NYC_1913.jpg — file deleted → replacement
 * 6. Democracy_Index_2022_complete.svg — file deleted → use Democracy_Index_2022.svg
 *
 * Run: cd tepup && npx tsx scripts/fix-broken-image-urls-v2.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

const URL_FIXES: Record<string, string> = {
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Map_of_unitary_and_federal_states.svg':
    'https://upload.wikimedia.org/wikipedia/commons/4/46/Map_of_unitary_and_federal_states.svg',

  'https://upload.wikimedia.org/wikipedia/commons/a/ac/Alexis_de_Tocqueville_%28Th%C3%A9odore_Chasseriau%29.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/8/8d/Th%C3%A9odore_Chass%C3%A9riau_-_Portrait_of_Alexis_de_Tocqueville.JPG',

  'https://upload.wikimedia.org/wikipedia/commons/5/5c/US_2016_presidential_election_by_county.svg':
    'https://upload.wikimedia.org/wikipedia/commons/a/a1/2016_United_States_presidential_election_results_map_by_county.svg',

  'https://upload.wikimedia.org/wikipedia/commons/6/6e/France_2002_presidential_election_second_round.svg':
    'https://upload.wikimedia.org/wikipedia/commons/5/5b/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2002_T2_carte_d%C3%A9partements_%26_r%C3%A9gions.svg',

  'https://upload.wikimedia.org/wikipedia/commons/8/87/Suffragette_City_NYC_1913.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/e/eb/Women_suffrage_march_new_york_city.jpeg',

  'https://upload.wikimedia.org/wikipedia/commons/4/4e/Democracy_Index_2022_complete.svg':
    'https://upload.wikimedia.org/wikipedia/commons/1/11/Democracy_Index_2022.svg',
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
