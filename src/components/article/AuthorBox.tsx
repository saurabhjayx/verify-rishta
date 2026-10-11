import Image from "next/image";
import Link from "next/link";
import type { Author } from "@/content/authors";

/** ponytail: bio rendered as plain paragraphs. Run it through renderMarkdown if bios need links. */
export const BioParagraphs = ({ bio }: { bio: string }) =>
  bio.split(/\n\s*\n/).map((para) => <p key={para}>{para.trim()}</p>);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Photo when we have one, otherwise initials. Fixed size, so no layout shift. */
export function Avatar({ author, size }: { author: Author; size: number }) {
  if (author.photo) {
    return (
      <Image
        src={author.photo}
        alt={author.name}
        width={size}
        height={size}
        className="shrink-0 rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-trust-soft font-serif font-semibold text-trust"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initials(author.name)}
    </span>
  );
}

export function AuthorBox({ author }: { author: Author }) {
  return (
    <section
      aria-labelledby="about-author"
      className="mt-10 flex gap-4 rounded-lg border border-border bg-surface p-5"
    >
      <Avatar author={author} size={56} />
      <div className="min-w-0 space-y-2 text-base">
        <h2
          id="about-author"
          className="font-sans text-sm font-semibold tracking-wide text-muted uppercase"
        >
          About the author
        </h2>
        <p>
          <Link
            href={`/authors/${author.slug}`}
            className="tap font-semibold text-text underline underline-offset-2"
          >
            {author.name}
          </Link>
          <span className="text-muted">, {author.role}</span>
        </p>
        <div className="space-y-2 text-muted">
          <BioParagraphs bio={author.bio} />
        </div>
      </div>
    </section>
  );
}
