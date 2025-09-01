import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const Container = ({ children }) => (
  <div className="mx-auto w-full max-w-3xl px-4 py-10 text-white">{children}</div>
);

function Terms(){
  return (
    <div className="min-h-screen bg-neutral-950">
      <Container>
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-invert mt-6 text-white/80">
          <h2>1. Service</h2>
          <p>Before/After provides embeddable widgets and a client portal for generating and previewing before/after images. We offer this as-is, with commercially reasonable uptime and support.</p>
          <h2>2. Acceptable use</h2>
          <p>No unlawful content; no images of minors; no infringement of third-party rights. You must have the consent of individuals whose images you upload.</p>
          <h2>3. Your data</h2>
          <p>Images you upload are processed to produce an edited output. We store minimal metadata for analytics and billing. See the Privacy Policy for details.</p>
          <h2>4. Plans & billing</h2>
          <p>Usage limits and entitlements are defined per plan. Exceeding limits may require a top‑up or plan upgrade.</p>
          <h2>5. Warranties & liability</h2>
          <p>Results are illustrative and not medical advice. To the maximum extent permitted by law, we disclaim implied warranties and limit liability to amounts paid in the last 12 months.</p>
          <h2>6. Termination</h2>
          <p>We may suspend or terminate accounts for abuse or non‑payment. You may cancel at any time in the portal.</p>
          <h2>7. Changes</h2>
          <p>We may update these Terms; material changes will be posted here with a new effective date.</p>
          <h2>8. Contact</h2>
          <p>Questions? Email support@before-after-embed.com.</p>
        </div>
      </Container>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Terms />);


