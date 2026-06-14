import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#4f46e5',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="4" height="10" fill="white" rx="1" />
          <rect x="10" y="6" width="4" height="15" fill="white" rx="1" />
          <rect x="17" y="2" width="4" height="19" fill="white" rx="1" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
