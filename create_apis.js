const fs = require('fs');
const path = require('path');

const routes = [
  'src/app/api/notifications/subscribe',
  'src/app/api/notifications/preferences',
  'src/app/api/players/rate',
  'src/app/api/tickets/purchase',
  'src/app/api/season-pass/purchase',
  'src/app/api/head-to-head',
  'src/app/api/fans/[userId]/follow',
  'src/app/api/predictions/submit',
  'src/app/api/whatsapp-bot',
  'src/app/api/admin/verify',
  'src/app/api/admin/news',
  'src/app/api/admin/matches',
  'src/app/api/admin/players/[playerId]/stats',
  'src/app/api/admin/tickets/pricing'
];

routes.forEach(route => {
  const dir = path.join(__dirname, route);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'route.ts');
  const cnt = `import { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({ success: true, isAdmin: true, message: "Mock GET endpoint" });\n}\n\nexport async function POST() {\n  return NextResponse.json({ success: true, message: "Mock POST endpoint", checkoutUrl: "/", pointsEarned: 10, reply: "Hello from CA WhatsApp bot!" });\n}\n\nexport async function PUT() {\n  return NextResponse.json({ success: true });\n}\n\nexport async function PATCH() {\n  return NextResponse.json({ success: true });\n}\n`;
  fs.writeFileSync(file, cnt);
});
console.log('Routes created!');
