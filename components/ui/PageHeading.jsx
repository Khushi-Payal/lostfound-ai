export default function PageHeading({ eyebrow, title, description, children, align = 'left' }) {
  return (
    <div className={`mb-8 ${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
      {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-teal">{eyebrow}</p>}
      <h1 className="text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl lg:text-[2.7rem]">{title}</h1>
      {description && <p className={`mt-4 text-base leading-7 text-muted sm:text-lg ${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
