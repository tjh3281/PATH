import { ProgrammeFolder, type FolderTab } from "@/components/programmes/programme-folder";
import { PROGRAMMES } from "@/data/programmes";

const TABS: FolderTab[] = PROGRAMMES.map((programme) => ({
  slug: programme.slug,
  shortName: programme.shortName,
  name: programme.name,
  tabName: programme.tabName,
  accent: programme.color,
}));

export default function ProgrammesLayout({ children }: LayoutProps<"/programmes">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16 sm:pt-6">
      <ProgrammeFolder tabs={TABS}>{children}</ProgrammeFolder>
    </main>
  );
}
