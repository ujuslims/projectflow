import type { SVGProps } from 'react';

export function ProjectFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5"
      aria-label="ProjectFlow Logo"
      {...props}
    >
      <style>
        {`
          .pf-text {
            font-family: var(--font-geist-sans), sans-serif;
            font-size: 28px; /* Adjusted for better fit */
            fill: hsl(var(--primary));
            font-weight: 600;
          }
          .pf-accent-rect {
            fill: hsl(var(--accent));
          }
          .pf-icon-path {
            stroke: hsl(var(--primary-foreground));
            stroke-width: 2.5; /* Adjusted for visibility */
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        `}
      </style>
      <rect className="pf-accent-rect" x="0" y="10" width="30" height="30" rx="5" />
      {/* Simplified flow icon */}
      <polyline className="pf-icon-path" points="7,25 13,18 23,28" fill="none" />
      <circle className="pf-icon-path" cx="7" cy="25" r="2" fill="hsl(var(--primary-foreground))" stroke="none" />
      <circle className="pf-icon-path" cx="13" cy="18" r="2" fill="hsl(var(--primary-foreground))" stroke="none" />
      <circle className="pf-icon-path" cx="23" cy="28" r="2" fill="hsl(var(--primary-foreground))" stroke="none" />
      
      <text x="40" y="35" className="pf-text">
        ProjectFlow
      </text>
    </svg>
  );
}
