const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const slug = process.argv[2];

(async () => {
  try {
    const story = await prisma.story.findFirst({
      where: { slug },
      include: {
        character: true,
        parts: { orderBy: { sortOrder: "asc" }, include: {
          chapters: { orderBy: { sortOrder: "asc" }, include: { content: true } }
        }}
      }
    });
    if (!story) { console.log("Not found"); await pool.end(); return; }
    console.log("Title:", story.title, "| Teaser:", story.teaser);
    for (const part of story.parts) {
      console.log("\n=== PART:", part.name, "===");
      for (const ch of part.chapters) {
        console.log("\n--- Ch:", ch.title, "---");
        if (ch.content) console.log(JSON.stringify(ch.content.blocks, null, 2));
        else console.log("No content");
      }
    }
    await pool.end();
  } catch (e) { console.error(e); await pool.end(); process.exit(1); }
})();
