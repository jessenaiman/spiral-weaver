import { ReferenceShelf } from '@/lib/narrative-service';
import SceneWeaverApp from '@/components/scene-weaver-app';

export default async function Home() {
  const referenceShelf = new ReferenceShelf();
  const stories = await referenceShelf.getStories();

  return (
    <main>
      <SceneWeaverApp stories={stories} />
    </main>
  );
}
