import { Suspense } from "react";
import CreateClient from "./CreateClient";

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="card">Loading...</div>}>
      <CreateClient />
    </Suspense>
  );
}

