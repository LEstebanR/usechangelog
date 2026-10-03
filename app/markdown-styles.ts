// The look of a rendered post body. Preflight resets lists and links, so they get it back
// here. Shared by the public page and the header preview (a client component, so this
// file stays free of server imports).
export const markdownClass =
  "space-y-3 leading-relaxed [&_a]:text-blue [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-ink [&_code]:bg-wash [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5";
