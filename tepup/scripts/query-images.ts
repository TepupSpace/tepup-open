import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const contents = await prisma.lessonContent.findMany({ select: { lessonId: true, blocks: true } });
  const imageBlocks: { lessonId: string; src: string; alt: string }[] = [];
  for (const c of contents) {
    const blocks = c.blocks as { type: string; src?: string; alt?: string }[];
    for (const b of blocks) {
      if (b.type === 'image' && b.src) {
        imageBlocks.push({ lessonId: c.lessonId, src: b.src, alt: b.alt || '' });
      }
    }
  }
  console.log(JSON.stringify(imageBlocks, null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
