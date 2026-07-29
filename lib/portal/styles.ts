/** Shared Tailwind class strings for the portal shell. */

const mono = 'font-mono uppercase tracking-[0.14em]'

const labelHalo =
  '[text-shadow:0_0_12px_var(--color-p-void),0_0_28px_var(--color-p-void),0_0_48px_var(--color-p-void),0_1px_0_var(--color-p-void)]'

export const portal = {
  mono,

  /** Meta labels (STACK, STUDIO, …) */
  label: `${mono} text-[10px] text-p-dim p-light:font-semibold ${labelHalo}`,

  /** Tighter meta under titles */
  meta: `${mono} text-[9px] text-p-dim p-light:font-semibold ${labelHalo}`,

  body: 'text-[15px] leading-relaxed text-p-mid',
  bodySm: 'text-[14px] text-p-mid',
  title: 'font-semibold tracking-[-0.02em] text-p-bright',
  titleLg: 'block font-semibold text-[1.15rem] tracking-[-0.02em] text-p-bright',

  link: [
    'mt-[18px] inline-block cursor-pointer border-0 bg-transparent p-0',
    'font-mono text-[11px] uppercase tracking-[0.12em] text-p-signal no-underline',
    '[text-shadow:0_0_12px_var(--color-p-void)]',
    'transition-opacity duration-150 hover:opacity-75',
  ].join(' '),

  back: [
    'mb-4 inline-flex cursor-pointer border-0 bg-transparent p-0',
    'font-mono text-[10px] uppercase tracking-[0.14em] text-p-dim',
    '[text-shadow:0_0_12px_var(--color-p-void)]',
    'transition-colors duration-150 hover:text-p-bright',
  ].join(' '),

  chromeControls: [
    'fixed top-3.5 right-3.5 z-[80] inline-flex items-center gap-0.5',
    'border border-p-bright/12 bg-p-void/55 p-[3px] backdrop-blur-[8px]',
  ].join(' '),

  chromeBtn: [
    'inline-flex size-[34px] shrink-0 cursor-pointer items-center justify-center',
    'rounded-none border-0 bg-transparent p-0 text-p-dim',
    'transition-[color,background-color,transform] duration-150 ease-out',
    'hover:bg-p-bright/8 hover:text-p-bright active:scale-[0.94]',
    'focus-visible:text-p-bright focus-visible:outline focus-visible:outline-1',
    'focus-visible:-outline-offset-1 focus-visible:outline-p-signal',
    'aria-pressed:text-p-mid',
    '[&_svg]:size-[15px] [&_svg]:shrink-0',
  ].join(' '),

  socials: 'flex flex-wrap items-center gap-[0.35rem]',

  social: [
    'inline-flex size-11 items-center justify-center text-p-dim no-underline',
    'transition-[color,background-color,transform] duration-150 ease-out',
    'hover:bg-p-bright/8 hover:text-p-bright active:scale-[0.94]',
    'focus-visible:text-p-bright focus-visible:outline focus-visible:outline-1',
    'focus-visible:-outline-offset-1 focus-visible:outline-p-signal',
  ].join(' '),

  socialSvg: 'size-4 shrink-0',

  shell: [
    'portal-shell group/shell fixed inset-0 z-40 overflow-hidden bg-p-void text-p-bright',
    'font-sans antialiased',
  ].join(' '),

  shellContent: [
    'absolute inset-0 z-20 overflow-hidden pointer-events-none',
    'transition-opacity duration-[180ms] ease-out',
    'group-data-[portal-phase=traveling]/shell:opacity-0',
    'group-data-[portal-phase=traveling]/shell:pointer-events-none',
    '*:pointer-events-auto *:absolute *:inset-0',
  ].join(' '),

  page: [
    'absolute inset-0 z-30 flex flex-col overflow-hidden pointer-events-none',
    'px-[clamp(24px,5vw,56px)] pt-[clamp(72px,12vh,120px)] pb-[120px]',
    'data-[side=left]:items-start data-[side=right]:items-end',
  ].join(' '),

  pageScroll: [
    'portal-float portal-emerge portal-scroll-halo pointer-events-auto',
    'max-h-[calc(100dvh-160px)] w-full max-w-[min(40rem,92vw)]',
    'overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]',
    'data-[wide]:max-w-[min(52rem,94vw)]',
    '[[data-side=right]_&]:pr-0 [[data-side=right]_&]:pl-2',
  ].join(' '),

  chamber: [
    'absolute inset-0 z-30 flex flex-col justify-start overflow-hidden pointer-events-none',
    'px-[clamp(24px,5vw,56px)] pt-[clamp(72px,12vh,120px)] pb-[72px]',
    'data-[side=left]:items-start data-[side=right]:items-end',
    'data-[open=false]:invisible data-[open=false]:opacity-0',
    '*:pointer-events-auto',
  ].join(' '),

  chamberScroll: [
    'portal-float portal-emerge portal-scroll-halo',
    'max-h-[calc(100dvh-220px)] w-full max-w-[min(36rem,90vw)]',
    'overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]',
    '[[data-side=right]_&]:pr-0 [[data-side=right]_&]:pl-2',
  ].join(' '),

  hero: [
    'absolute top-[min(22vh,9rem)] z-20 max-w-[min(36rem,88vw)] md:top-[min(24vh,11rem)]',
    'data-[side=left]:left-[clamp(1.25rem,6vw,8%)] data-[side=left]:right-auto',
    'data-[side=right]:right-[clamp(1.25rem,6vw,8%)] data-[side=right]:left-auto',
  ].join(' '),

  /** About portrait — ASCII rest, photo on dissolve */
  aboutPortrait: 'mb-1 w-[min(14rem,70vw)] sm:w-[min(16rem,42vw)]',

  /** Work list company mark — ASCII → logo dissolve */
  workLogo: 'w-11 shrink-0 sm:w-12',
  workLogoLg: 'w-[4.5rem] shrink-0 sm:w-20',

  eyebrow: 'inline-flex items-center gap-[0.55rem]',
  eyebrowMark: 'inline-flex shrink-0 text-p-signal',

  status: 'inline-flex items-center gap-[0.55rem] text-p-mid',
  statusDot: [
    'size-[7px] shrink-0 rounded-full bg-p-signal',
    'shadow-[0_0_0_0_color-mix(in_oklab,var(--color-p-signal)_55%,transparent)]',
    '[[data-available=true]_&]:animate-portal-status-pulse',
    '[[data-available=false]_&]:bg-p-dim [[data-available=false]_&]:shadow-none',
  ].join(' '),

  transit: 'absolute inset-0 z-[60] grid place-items-center pointer-events-none text-center',
  transitMark: [
    'portal-emerge flex max-w-[min(20ch,86vw)] flex-col items-center gap-[0.55rem]',
    '[text-shadow:0_0_24px_var(--color-p-void),0_0_48px_var(--color-p-void),0_2px_8px_var(--color-p-void)]',
  ].join(' '),
  transitEyebrow: `${mono} m-0 text-[10px] tracking-[0.18em] text-p-dim`,
  transitTitle: [
    'm-0 text-balance font-semibold text-p-bright',
    'text-[clamp(2rem,5vw,3.25rem)] leading-[0.92] tracking-[-0.04em]',
  ].join(' '),

  wheelDock: [
    'absolute inset-x-0 bottom-[max(10px,env(safe-area-inset-bottom,0px))] z-50',
    'flex flex-col items-center justify-end overflow-visible pointer-events-none',
    'data-[open]:z-[70] [&>*]:pointer-events-auto',
  ].join(' '),

  wheelScrim: [
    'fixed inset-0 z-[65] m-0 cursor-pointer border-0 p-0',
    'bg-p-void/48 [-webkit-tap-highlight-color:transparent]',
  ].join(' '),

  wheelTrigger: [
    'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-none',
    'border border-p-bright/14 bg-p-void/62 px-3.5 py-2 pl-3 text-p-mid',
    'shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-p-void)_40%,transparent),0_8px_28px_color-mix(in_oklab,var(--color-p-void)_45%,transparent)]',
    'backdrop-blur-[10px] transition-[color,background-color,border-color] duration-[160ms] ease-in-out',
    'hover:border-p-bright/28 hover:bg-p-void/48 hover:text-p-bright',
    'focus-visible:text-p-bright focus-visible:outline focus-visible:outline-1',
    'focus-visible:outline-offset-2 focus-visible:outline-p-signal',
    'disabled:cursor-default disabled:opacity-45',
  ].join(' '),

  wheelTriggerGlyph: 'inline-flex size-7 items-center justify-center text-p-signal [&_svg]:size-4',
  wheelTriggerLabel:
    'text-balance font-sans text-xs font-semibold tracking-[-0.01em] text-inherit',
  wheelTriggerDot:
    'size-[5px] rounded-full bg-p-signal shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-p-signal)_18%,transparent)]',

  wheelPanel: [
    'relative z-[2] w-[min(440px,92vw)] border border-p-bright/12 bg-p-void/72',
    'px-2 pt-2.5 pb-1 will-change-[clip-path] backdrop-blur-[14px]',
    'shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-p-void)_50%,transparent),0_18px_48px_color-mix(in_oklab,var(--color-p-void)_55%,transparent)]',
  ].join(' '),

  wheelDismiss: [
    'absolute top-1.5 right-1.5 z-[3] inline-flex size-11 cursor-pointer',
    'items-center justify-center border-0 bg-transparent p-0 text-p-dim',
    'transition-[color,background-color] duration-[140ms]',
    'hover:bg-p-bright/8 hover:text-p-bright active:scale-[0.96]',
    'focus-visible:text-p-bright focus-visible:outline focus-visible:outline-1',
    'focus-visible:-outline-offset-1 focus-visible:outline-p-signal',
    '[&_svg]:size-4',
  ].join(' '),

  wheel: 'relative z-auto flex w-full justify-center pointer-events-none',
  wheelSvg: 'mx-auto block h-auto w-full max-w-[440px] overflow-visible pointer-events-none',
} as const
