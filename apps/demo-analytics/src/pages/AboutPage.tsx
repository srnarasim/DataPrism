import React from "react";

export default function AboutPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">About DataPrism</h1>
      <p className="text-gray-600 mb-4">
        DataPrism Core is a high-performance browser-based analytics engine powered by WebAssembly and DuckDB.
      </p>
      <p className="text-gray-600">
        This demo application showcases the capabilities of the DataPrism platform.
      </p>
    </div>
  );
}