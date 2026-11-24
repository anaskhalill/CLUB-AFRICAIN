import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const res = await fetch('https://news.google.com/rss/search?q=club+africain+tunisie&hl=fr&gl=TN&ceid=TN:fr', {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch news');
    const xml = await res.text();

    let items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    // Parse Google News RSS
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title>([^<]+)<\/title>/);
      const linkMatch = itemXml.match(/<link>([^<]+)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([^<]+)<\/pubDate>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([^<]+)<\/source>/);

      if (titleMatch && linkMatch) {
        let title = titleMatch[1];
        // Clean up title format "News Title - Source Name"
        title = title.replace(/\s+-\s+[^-]+$/, '');
        // Replace HTML entities
        title = title.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        
        const source = sourceMatch ? sourceMatch[1] : 'News';
        
        // Filter out Eurosport news
        if (source.toLowerCase().includes('eurosport') || title.toLowerCase().includes('eurosport')) {
          continue;
        }
        
        const timestamp = pubDateMatch ? new Date(pubDateMatch[1]).getTime() : Date.now();
        let date = pubDateMatch ? new Date(pubDateMatch[1]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'RECENT';
        
        const url = linkMatch[1];
        
        let cat = 'Actualité';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('match') || titleLower.includes('résultat') || titleLower.includes('coupe') || titleLower.includes('ligue') || titleLower.includes('score')) cat = 'Match';
        if (titleLower.includes('transfert') || titleLower.includes('mercato') || titleLower.includes('signer')) cat = 'Transfert';

        items.push({
          title,
          date,
          timestamp,
          source,
          cat,
          url
        });
      }
    }

    // Sort items by new to old
    items.sort((a, b) => b.timestamp - a.timestamp);

    // Pick top 12 items and assign images
    items = items.slice(0, 12).map((item, num) => ({
      ...item,
      img: `/${(num % 3) + 1}.png`
    }));

    if (items.length === 0) {
      throw new Error('No items parsed');
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching news:', error);
    // Fallback to static if fetching fails
    return NextResponse.json({
      items: [
        { title: "Club Africain celebrates 100 years of pride", date: "21 MAR 2026", cat: "Event", img: "/1.png", url: "https://www.clubafricain.com", source: "Official Site" },
        { title: "Training update ahead of Monastir clash", date: "20 MAR 2026", cat: "Actualité", img: "/2.png", url: "https://www.foot24.tn", source: "Foot24" },
        { title: "New high-tech training center project", date: "19 MAR 2026", cat: "Infrastructure", img: "/3.png", url: "https://www.tunisienumerique.com", source: "Tunisie Numerique" }
      ]
    });
  }
}

