import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'InboxSignal — Turn cold emails into replies';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090B',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <span style={{ fontSize: 48, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.03em' }}>InboxSignal</span>
        </div>
        <p style={{ fontSize: 24, color: '#71717A', fontWeight: 400, margin: 0 }}>Turn cold emails into replies.</p>
        <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#3B82F6' }}>0–100</span>
            <span style={{ fontSize: 14, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Signal Score</span>
          </div>
          <div style={{ width: 1, background: '#27272A' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#EF4444' }}>4</span>
            <span style={{ fontSize: 14, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Failure Points</span>
          </div>
          <div style={{ width: 1, background: '#27272A' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#22C55E' }}>AI</span>
            <span style={{ fontSize: 14, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rewrite</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
