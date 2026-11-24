import { NextResponse } from 'next/server';

export async function GET() {
  const players = [
    { name: "Mouez Hassen", position: "Goalkeeper", number: 1, age: 29, nationality: "Tunisian", image: "/players/mouez.webp", instagram: "https://instagram.com/mouezhassen", potential: 85 },
    { name: "Rami Bedoui", position: "Defender", number: 2, age: 34, nationality: "Tunisian", image: "/players/bedoui.png", instagram: "https://instagram.com", potential: 78 },
    { name: "Bassem Srarfi", position: "Forward", number: 7, age: 26, nationality: "Tunisian", image: "/players/srarfi.png", instagram: "https://instagram.com", potential: 88 },
    { name: "Kingsley Eduwo", position: "Forward", number: 9, age: 27, nationality: "Nigerian", image: "/players/eduwo.png", instagram: "https://instagram.com", potential: 84 },
    { name: "Zemzemi", position: "Midfielder", number: 8, age: 24, nationality: "Tunisian", image: "/players/zemzmi.png", instagram: "https://instagram.com", potential: 86 },
    { name: "Zaalouni", position: "Defender", number: 4, age: 22, nationality: "Tunisian", image: "/players/zaalouni.webp", instagram: "https://instagram.com", potential: 91 },
    // Add more players as needed based on common references
  ];

  return NextResponse.json(players);
}
