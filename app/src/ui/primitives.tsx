import React from 'react';

/* Shared UI primitives - the app's reusable controls, styled with Tailwind
   utilities on the @theme tokens (see index.css). Views compose these instead
   of re-assembling class strings; bespoke chart visuals keep their own CSS. */

const TRANSITION = 'transition-[background-color,color,border-color,box-shadow] duration-150';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  const base = `inline-flex items-center justify-center gap-2 self-start rounded-full px-[22px] py-2.5 text-sm min-h-11 cursor-pointer ${TRANSITION}`;
  const styles =
    variant === 'ghost'
      ? 'bg-transparent border border-solid border-white/25 text-txt font-extrabold hover:bg-transparent hover:border-green hover:text-green'
      : 'border-0 bg-green text-black font-extrabold hover:bg-green-soft';
  return <button type={type} className={`${base} ${styles} ${className}`.trim()} {...rest} />;
}

export function Chip({
  on = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps & { on?: boolean }) {
  // Never put two same-group utilities on one element (bg-panel-2 + bg-green):
  // stylesheet order, not class order, decides - so the state styles switch.
  const cls = [
    /* Rendered legacy chip is 16px/400: `.tj button { font: inherit }` (0,1,1) always beat
       `.tj-chip`'s 13px/700 (0,1,0). Utilities would win, so match the RENDERED look. */
    `rounded-full border-0 px-[18px] py-[9px] text-base font-normal min-h-11 cursor-pointer ${TRANSITION}`,
    on ? 'bg-green text-black shadow-[0_4px_14px_rgba(29,185,84,.35)]' : 'bg-panel-2 text-txt',
    className,
  ]
    .join(' ')
    .trim();
  return <button type={type} className={cls} aria-pressed={on} {...rest} />;
}

export function Tab({
  on = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps & { on?: boolean }) {
  const cls = [
    /* Same `.tj button` story as Chip: legacy tabs render 16px/400, not 14px/700 -
       and the 640px 13px rule lost too, so no max-sm text override here. */
    `text-left rounded-lg px-3 py-2.5 min-h-11 text-base font-normal cursor-pointer border-0 max-sm:py-2 max-sm:whitespace-nowrap ${TRANSITION}`,
    on
      ? 'text-txt bg-panel-2 shadow-[inset_2px_0_0_var(--color-green)] max-sm:bg-transparent max-sm:shadow-[inset_0_-2px_0_var(--color-green)]'
      : 'bg-transparent text-txt-2 hover:text-txt',
    className,
  ]
    .join(' ')
    .trim();
  return <button type={type} className={cls} aria-pressed={on} {...rest} />;
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="mb-3.5 text-[10.5px] font-bold uppercase tracking-[.16em] text-green">{children}</p>;
}

const RISE = 'animate-[tj-rise_.28s_ease-out_both]';

export function CardAside({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-[12.5px] font-semibold text-txt-2">{children}</p>;
}

export function Card({
  id,
  label,
  title,
  aside,
  animated = true,
  className = '',
  children,
  ...rest
}: {
  id?: string;
  label?: string;
  title?: React.ReactNode;
  aside?: React.ReactNode;
  animated?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={[
        'rounded-2xl border border-white/5 bg-panel px-5 py-[18px]',
        animated ? RISE : '',
        className,
      ]
        .join(' ')
        .trim()}
      aria-labelledby={id}
      aria-label={label}
      {...rest}
    >
      {(title != null || aside != null) && (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2.5">
          {title != null && (
            <h3 id={id} className="m-0 text-[17px] font-extrabold tracking-[-.01em]">
              {title}
            </h3>
          )}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Section({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-3 pt-[18px] border-t border-solid border-white/[.06] first-of-type:border-t-0 first-of-type:pt-0 ${RISE}`}
      aria-labelledby={id}
    >
      <div className="flex justify-between items-baseline gap-2.5">
        <h3 id={id} className="m-0 text-[17px] font-extrabold tracking-[-.01em]">
          {title}
        </h3>
        {aside != null && <p className="m-0 text-txt-2 text-[12.5px] font-semibold">{aside}</p>}
      </div>
      {children}
    </section>
  );
}

export function RankList({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <ol className={`list-none m-0 p-0 flex flex-col ${className}`.trim()}>{children}</ol>;
}

export function RankRow({
  rank,
  thumb,
  title,
  sub,
  value,
}: {
  rank: number;
  thumb: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  value?: React.ReactNode;
}) {
  return (
    <li className={`flex items-center gap-3 px-2 py-[7px] rounded-lg hover:bg-panel-2 ${TRANSITION}`}>
      <span className="w-[18px] text-right text-txt-2 text-[13px] font-bold shrink-0 max-[400px]:hidden">
        {rank}
      </span>
      <span
        className="w-10 h-10 shrink-0 block rounded-[10px] shadow-[0_4px_10px_rgba(0,0,0,.4)]"
        style={{ background: thumb }}
      />
      <span className="flex-1 min-w-0 font-bold text-sm overflow-hidden text-ellipsis whitespace-nowrap">
        {title}
        {sub != null && (
          <em className="block not-italic text-txt-2 text-xs font-semibold overflow-hidden text-ellipsis">
            {sub}
          </em>
        )}
      </span>
      {value != null && <span className="text-txt-2 text-[13px] font-bold shrink-0">{value}</span>}
    </li>
  );
}

export function Checkbox({
  label,
  className = '',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label
      className={`flex items-center gap-[9px] text-sm font-bold min-h-8 cursor-pointer ${className}`.trim()}
    >
      <input type="checkbox" className="accent-green w-[17px] h-[17px]" {...rest} />
      {label}
    </label>
  );
}

export function FileInput({
  inputRef,
  onFiles,
  accept = '.json,application/json',
  label,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  onFiles: (files: File[]) => void;
  accept?: string;
  label: string;
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept={accept}
      aria-label={label}
      className="absolute w-px h-px overflow-hidden [clip:rect(0_0_0_0)] whitespace-nowrap"
      onChange={(e) => {
        const files = e.target.files ? [...e.target.files] : [];
        if (files.length > 0) onFiles(files);
        e.target.value = '';
      }}
    />
  );
}
