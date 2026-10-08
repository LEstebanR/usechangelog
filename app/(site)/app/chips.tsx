// Radio buttons drawn as chips. `chipClass` styles each option, including its
// checked look with `peer-checked:` classes.
export function Chips<T extends string>({ name, legend, options, value, label, chipClass, hint }: {
  name: string;
  legend: string;
  options: readonly T[];
  value: T;
  label: (option: T) => string;
  chipClass: (option: T) => string;
  hint?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input type="radio" name={name} value={option} defaultChecked={value === option} className="peer sr-only" />
            <span
              className={`block border border-hairline text-graphite transition-colors hover:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${chipClass(option)}`}
            >
              {label(option)}
            </span>
          </label>
        ))}
      </div>
      {hint && <p className="text-sm text-graphite">{hint}</p>}
    </fieldset>
  );
}
