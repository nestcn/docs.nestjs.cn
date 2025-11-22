import { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdBanner({ 
  slot, 
  format = 'auto', 
  responsive = true,
  style = {}
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3319999205844901"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
