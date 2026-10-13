'use client';

import { useEffect, useState } from 'react';

// Base64, damit die Nummer weder im HTML noch im Klartext im JS-Bundle steht.
const encoded = 'KzQ5IDE3NiA4MDAwMzYxMg==';

/** Handynummer erst im Browser einsetzen, damit einfache Crawler sie nicht einsammeln. */
export function Phone({ className }: { className?: string }) {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => setPhone(atob(encoded)), []);

  if (!phone) return null;
  return (
    <a
      href={`tel:${phone.replaceAll(' ', '')}`}
      className={className}
      data-nosnippet
    >
      {phone}
    </a>
  );
}
