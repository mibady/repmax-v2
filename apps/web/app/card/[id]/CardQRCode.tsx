'use client';

import { QRCodeSVG } from 'qrcode.react';

export default function CardQRCode({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <QRCodeSVG
        value={url}
        size={120}
        bgColor="#0a0a0a"
        fgColor="#EDBC1D"
        level="M"
      />
      <p className="text-[10px] text-gray-500 font-mono">{url}</p>
    </div>
  );
}
