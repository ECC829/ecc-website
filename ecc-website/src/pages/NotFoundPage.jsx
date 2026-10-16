import { Link } from "react-router-dom";
import { Container } from "../components/ui";

export default function NotFoundPage() {
  return (
    <Container className="flex min-h-[62vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-[8rem] font-bold leading-none text-white/[0.08] sm:text-[12rem]">
        404
      </p>
      <h1 className="headline -mt-8 text-4xl sm:text-5xl">Play and a miss</h1>
      <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-400">
        That page isn't on the scorecard. It may have moved, or the link might be
        out of date.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
        <Link to="/teams" className="btn-ghost">
          Browse teams
        </Link>
      </div>
    </Container>
  );
}
