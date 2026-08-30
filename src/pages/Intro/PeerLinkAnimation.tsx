import React from 'react'
import styled, { keyframes } from 'styled-components'

const drawArc = keyframes`
  to { stroke-dashoffset: 0; }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
`

const Stage = styled.div`
  width: 100%;
  height: 100%;

  .peer-arc {
    stroke-dasharray: 180;
    stroke-dashoffset: 180;
    animation: ${drawArc} 1.1s 0.2s ease-out forwards;
  }

  .peer-spark {
    animation: ${pulse} 1.6s 1.2s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .peer-arc {
      animation: none;
      stroke-dashoffset: 0;
    }

    .peer-spark {
      animation: none;
      opacity: 0.8;
    }
  }
`

const Plate = ({ x }: { x: number }) => (
  <g transform={`translate(${x} 86)`}>
    <rect
      x="4"
      y="4"
      width="56"
      height="56"
      rx="2"
      fill="#14161b"
      stroke="#b08d57"
      strokeWidth="1.5"
    />
    <rect
      x="14"
      y="14"
      width="36"
      height="36"
      rx="2"
      fill="#08090b"
      stroke="#2a2e36"
      strokeWidth="1"
    />
    <rect x="25" y="20" width="14" height="14" rx="2" fill="#d4af77" />
    <rect x="29" y="32" width="6" height="14" rx="1" fill="#d4af77" />
  </g>
)

export const PeerLinkAnimation = (): React.ReactElement => {
  return (
    <Stage data-testid="peer-link-animation">
      <svg viewBox="0 0 260 260" width="100%" height="100%" role="img">
        <title>Devices linking without a cloud</title>
        <path
          className="peer-arc"
          d="M78 116 C 110 48, 150 48, 182 116"
          fill="none"
          stroke="#b08d57"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle className="peer-spark" cx="130" cy="68" r="4" fill="#d4af77" />
        <Plate x={20} />
        <Plate x={176} />
      </svg>
    </Stage>
  )
}
