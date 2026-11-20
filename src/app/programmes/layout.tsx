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
    // 72rem of content plus the 1rem gutters, so the folder's edges line up with the menu bar's.
    <main className="mx-auto w-full max-w-[74rem] px-4 pt-4 pb-16 sm:pt-6">
      <ProgrammeFolder tabs={TABS}>{children}</ProgrammeFolder>
    </main>
  );
}
