"use client";

import "./globals.css";

const GlobalError = ({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <html className="dark" lang="en">
    <body className="flex min-h-svh flex-col items-start justify-center gap-6 p-8">
      <p className="label text-signal-rust">System fault</p>
      <h1 className="text-4xl font-semibold">The workshop failed to boot.</h1>
      <button
        className="label border-rule-strong border px-4 py-2"
        onClick={reset}
        type="button"
      >
        Retry
      </button>
    </body>
  </html>
);

export default GlobalError;
