import { notFound } from "next/navigation";

// Routes nothing else matches fall through here so they get the localised not-found page.
export default function CatchAll() {
  notFound();
}
