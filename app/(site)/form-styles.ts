// Shared form styles for the auth and app pages.
export const inputClass =
  "border border-hairline bg-canvas px-3 py-2 placeholder:text-graphite/70 focus:border-blue aria-invalid:border-clay";

// Buttons and button-looking links share a box: one line, centred, so a label like
// "Sign out" never wraps on a phone and links line up with real buttons.
const buttonBox = "inline-flex items-center justify-center whitespace-nowrap text-center";

export const primaryButtonClass =
  `${buttonBox} motion-press bg-blue px-4 py-2.5 font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-60`;

export const dangerButtonClass =
  `${buttonBox} motion-press bg-clay px-4 py-2.5 font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40`;

export const secondaryButtonClass =
  `${buttonBox} motion-press border border-ink px-4 py-2.5 font-medium transition-colors hover:bg-ink hover:text-canvas disabled:opacity-50`;
