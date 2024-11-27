"use client";

import { BridgeForm } from "../components/BridgeForm";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-secondary-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-secondary-900">
          Bridge to Bitfinity
        </h1>
        <BridgeForm />
      </div>
    </main>
  );
}
