import React from 'react'
import styled, { keyframes } from 'styled-components'

const wheelTurn = keyframes`
  to { transform: rotate(270deg); }
`

const boltIn = keyframes`
  to { transform: translateY(14px); }
`

const doorOpen = keyframes`
  to { transform: scaleX(0.08); }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
`

const Stage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 520px;

  .vault-door {
    transform-box: view-box;
    transform-origin: 36px 130px;
    animation: ${doorOpen} 1.1s 2s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  }

  .vault-wheel {
    transform-box: view-box;
    transform-origin: 130px 130px;
    animation: ${wheelTurn} 1s 0.35s cubic-bezier(0.22, 0.8, 0.3, 1) forwards;
  }

  .vault-bolt {
    transform-box: fill-box;
    transform-origin: center;
    animation: ${boltIn} 0.7s 1.15s ease-in forwards;
  }

  .vault-glow {
    animation: ${glowPulse} 2.4s 3s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .vault-door {
      animation: none;
      transform: scaleX(0.08);
    }

    .vault-wheel {
      animation: none;
      transform: rotate(270deg);
    }

    .vault-bolt {
      animation: none;
      transform: translateY(14px);
    }

    .vault-glow {
      animation: none;
      opacity: 0.5;
    }
  }
`

const BOLTS = [0, 45, 90, 135, 180, 225, 270, 315]

export const VaultUnlockAnimation = (): React.ReactElement => {
  return (
    <Stage data-testid="vault-unlock-animation">
      <svg viewBox="0 0 260 260" width="100%" height="100%" role="img">
        <title>Lockwright vault unlocking</title>
        <defs>
          <radialGradient id="vault-void" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#d4af77" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#08090b" />
            <stop offset="100%" stopColor="#08090b" />
          </radialGradient>
          <linearGradient id="vault-brass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6c98a" />
            <stop offset="45%" stopColor="#d4af77" />
            <stop offset="100%" stopColor="#8a6a38" />
          </linearGradient>
          <linearGradient id="vault-iron" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a2e36" />
            <stop offset="100%" stopColor="#14161b" />
          </linearGradient>
        </defs>

        <circle cx="130" cy="130" r="118" fill="#08090b" />
        <ellipse
          className="vault-glow"
          cx="130"
          cy="130"
          rx="72"
          ry="72"
          fill="url(#vault-void)"
        />
        <circle
          cx="130"
          cy="130"
          r="108"
          fill="none"
          stroke="#b08d57"
          strokeWidth="6"
        />
        <circle
          cx="130"
          cy="130"
          r="100"
          fill="none"
          stroke="#2a2e36"
          strokeWidth="2"
        />

        <g className="vault-door">
          <circle cx="130" cy="130" r="94" fill="url(#vault-iron)" />
          <circle
            cx="130"
            cy="130"
            r="94"
            fill="none"
            stroke="#b08d57"
            strokeWidth="3"
          />
          <circle
            cx="130"
            cy="130"
            r="78"
            fill="none"
            stroke="#8a6a38"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {BOLTS.map((deg) => (
            <g key={deg} transform={`rotate(${deg} 130 130)`}>
              <rect
                className="vault-bolt"
                x="126"
                y="42"
                width="8"
                height="22"
                rx="2"
                fill="url(#vault-brass)"
              />
            </g>
          ))}

          <g className="vault-wheel">
            <circle
              cx="130"
              cy="130"
              r="28"
              fill="#14161b"
              stroke="#d4af77"
              strokeWidth="3"
            />
            <rect x="127" y="104" width="6" height="52" rx="1" fill="#d4af77" />
            <rect x="104" y="127" width="52" height="6" rx="1" fill="#d4af77" />
            <circle cx="130" cy="130" r="8" fill="#b08d57" />
          </g>
        </g>

        <rect x="70" y="122" width="10" height="16" rx="1" fill="#b08d57" />
      </svg>
    </Stage>
  )
}
