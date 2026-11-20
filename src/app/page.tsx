import { redirect } from "next/navigation";

import { PROGRAMMES } from "@/data/programmes";

// The Programme Explorer is the landing page until the home page is designed.
export default function Home() {
  redirect(`/programmes/${PROGRAMMES[0].slug}`);
}
