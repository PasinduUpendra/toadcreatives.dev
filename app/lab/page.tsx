import type { Metadata } from "next";
import LabShell from "@/components/lab/LabShell";

export const metadata: Metadata = {
  title: "Motion Lab",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <LabShell />;
}
