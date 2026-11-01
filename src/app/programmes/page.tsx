import { redirect } from "next/navigation";

import { PROGRAMMES } from "@/data/programmes";

export default function ProgrammesIndex() {
  redirect(`/programmes/${PROGRAMMES[0].slug}`);
}
