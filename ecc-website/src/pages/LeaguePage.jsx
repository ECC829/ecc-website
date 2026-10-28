import { Container, PageHeader, Section } from "../components/ui";
import CricClubsPanel from "../components/CricClubsPanel";

export default function LeaguePage() {
  return (
    <>
      <PageHeader
        eyebrow="Easton Cricket League"
        title="Scores & stats"
        lead="Live scores, results, fixtures, the points table and player stats for ECC's league — straight from CricClubs."
      />
      <Section>
        <Container>
          <CricClubsPanel />
        </Container>
      </Section>
    </>
  );
}
