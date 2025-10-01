import { PrismaClient } from '@prisma/client';
import narrativeData from '../src/lib/data/sample-narrative.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  for (const storyData of narrativeData.stories) {
    const story = await prisma.story.create({
      data: {
        storyId: storyData.storyId,
        title: storyData.title,
        summary: storyData.summary,
      },
    });

    for (const chapterData of storyData.chapters) {
      const chapter = await prisma.chapter.create({
        data: {
          chapterId: chapterData.chapterId,
          name: chapterData.name,
          synopsis: chapterData.synopsis,
          metadata: JSON.stringify(chapterData.metadata),
          storyId: story.id,
        },
      });

      for (const arcData of chapterData.arcs) {
        const arc = await prisma.arc.create({
          data: {
            arcId: arcData.arcId,
            label: arcData.label,
            theme: arcData.theme,
            chapterId: chapter.id,
          },
        });

        for (const momentData of arcData.moments) {
          await prisma.moment.create({
            data: {
              momentId: momentData.momentId,
              title: momentData.title,
              content: momentData.content,
              timeline: JSON.stringify(momentData.timeline),
              themes: JSON.stringify(momentData.themes),
              lore: JSON.stringify(momentData.lore),
              subtext: JSON.stringify(momentData.subtext),
              narrativeBeats: momentData.content || '', // Use content as narrativeBeats
              branchingHooks: JSON.stringify(momentData.branchingHooks),
              sensoryAnchors: JSON.stringify(momentData.sensoryAnchors),
              loreRefs: JSON.stringify(momentData.loreRefs),
              restrictionTags: JSON.stringify(momentData.restrictionTags),
              arcId: arc.id,
            },
          });
        }
      }
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });