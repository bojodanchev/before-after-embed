// NOTE: This endpoint can be removed to stay under the Vercel Hobby limit.
// The widget now relies on the server-side logging in /api/edit and the portal reads from KV.
export default async function handler(_req, res){
  res.status(410).json({ error: 'Gone' });
}


