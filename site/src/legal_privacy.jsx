import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const Container = ({ children }) => (
  <div className="mx-auto w-full max-w-3xl px-4 py-10 text-white">{children}</div>
);

function Privacy(){
  return (
    <div className="min-h-screen bg-neutral-950">
      <Container>
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-invert mt-6 text-white/80">
          <h2>Overview</h2>
          <p>We process images to generate edited previews. We minimize the personal data we store and retain it only as long as necessary for service delivery, analytics, and billing.</p>
          <h2>Data we collect</h2>
          <ul>
            <li>Account info (email, tenant id)</li>
            <li>Image uploads and generated outputs (temporary processing URLs)</li>
            <li>Usage events (timestamp, embed id, plan)</li>
          </ul>
          <h2>How we use data</h2>
          <p>To provide the service, troubleshoot, protect against abuse, and measure usage. We do not sell personal data.</p>
          <h2>Image processing</h2>
          <p>Images are transmitted to our model provider (fal.ai) for processing. The provider returns a URL for the edited image which may be hosted on provider infrastructure or a CDN. We do not use uploaded images to train models.</p>
          <h2>Storage & retention</h2>
          <p>Operational data may be stored in third‑party infrastructure (e.g., Vercel, Redis/KV, storage/CDN). Uploaded images and outputs are retained only as needed to render previews and are not persisted by us beyond short‑term caching. Links may remain accessible while cached by the provider/CDN.</p>
          <h2>Security</h2>
          <p>We use access controls, least‑privilege credentials, and audit logs. Nevertheless, no system is 100% secure; use at your own risk.</p>
          <h2>Your rights</h2>
          <p>You may request deletion of your tenant account. For EU users, we support data access/deletion upon verified request.</p>
          <h2>Contact</h2>
          <p>privacy@before-after-embed.com</p>
        </div>
      </Container>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Privacy />);

