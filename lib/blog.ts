export type BlogPost = {
  slug: string;
  title: string;
  description: string; // meta description ~155 chars
  excerpt: string;     // card teaser
  category: string;
  readTime: string;
  publishedAt: string; // ISO date
  author: { name: string; role: string; initials: string; color: string };
  keywords: string[];
  sections: BlogSection[];
  faq: { q: string; a: string }[];
  relatedLinks?: { label: string; url: string; description: string }[];
};

type BlogSection = {
  heading: string;
  body: string; // supports \n\n for paragraph breaks
  list?: string[];
};

export const blogPosts: BlogPost[] = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "why-social-discovery-is-the-future-of-shopping-in-kenya",
    title: "Why Social Discovery Is the Future of Shopping in Kenya",
    description:
      "Kenyan shoppers are skipping search engines and heading straight to social feeds. Discover why social discovery is reshaping e-commerce in Nairobi and beyond.",
    excerpt:
      "Search is dead for product discovery. Kenyan buyers now find what they want by scrolling — not typing. Here's why that changes everything.",
    category: "Trends",
    readTime: "6 min read",
    publishedAt: "2026-05-10",
    author: { name: "Amara Osei", role: "Head of Growth", initials: "AO", color: "#f59e0b" },
    keywords: [
      "social commerce Kenya",
      "social discovery shopping",
      "buy online Kenya",
      "Nairobi e-commerce",
      "TikTok shopping Africa",
      "video commerce",
      "discover products online",
      "local sellers Kenya",
    ],
    sections: [
      {
        heading: "The search-first era is ending",
        body: "For two decades, product discovery meant opening a search engine, typing a query, and hoping the algorithm surfaced what you were looking for. That model worked when catalogues were the only alternative. Today, it feels like work.\n\nAcross Kenya — in Nairobi's Westlands, Mombasa's Old Town, Kisumu's lakeside markets — a different behaviour has taken hold. People open an app, start scrolling, and discover products they didn't know they needed. The product found them. That is social discovery.",
      },
      {
        heading: "Why video is the product page that actually converts",
        body: "A static image shows you what something looks like. A video shows you how it feels, how it moves, who made it, and why they love it. For categories like fashion, home décor, food, and electronics — the categories that define Kenyan informal commerce — video is not a nice-to-have. It is the product page.\n\nVideo-first social platforms consistently see buyers engage far more with moving product demos than with static photos. On Shopi there is no cart, no checkout friction, no abandoned sessions — a buyer watches, messages the seller, and the two of them close the deal in a single conversation.",
      },
      {
        heading: "Trust is local, and local is powerful",
        body: "In Kenya's social commerce landscape, proximity builds trust. Buyers want to know a seller is in Kiambu, not a warehouse in Guangzhou. They want to see a face, hear a voice, read genuine reviews from people in the same neighbourhood.\n\nSocial discovery feeds that surface local sellers first tap into a trust dynamic that no global marketplace can replicate. When you see your neighbour's favourite fashion vendor on your feed, the decision to buy is already half-made.",
        list: [
          "Location-tagged posts surface sellers within a buyer's delivery radius",
          "Profile verification signals legitimacy without bureaucratic friction",
          "Buyer reviews tied to real accounts create authentic social proof",
          "Direct messaging lets buyers negotiate, ask questions, and build relationships",
        ],
      },
      {
        heading: "The infrastructure is finally here",
        body: "Kenya leads sub-Saharan Africa in mobile internet penetration. M-PESA makes payment frictionless. Affordable smartphones mean video content is accessible to sellers at every income level. The infrastructure for social commerce has quietly assembled itself — all it needed was a platform built around discovery rather than search.",
      },
      {
        heading: "What this means for sellers",
        body: "If you are a seller in Kenya and you are not creating short videos of your products, you are invisible to the largest and fastest-growing segment of buyers. Social discovery does not reward the biggest catalogue — it rewards authenticity, consistency, and local relevance. A seller posting three genuine videos a week will out-earn a competitor with a polished website and zero social presence.\n\nThe barrier to entry has never been lower. A smartphone, good light, and a real product are all you need to start.",
      },
    ],
    faq: [
      {
        q: "What is social discovery in e-commerce?",
        a: "Social discovery is the process of finding products through social feeds, videos, and peer recommendations rather than through active search. Platforms like Shopi are built around this model — surfacing relevant products to buyers before they know they want them.",
      },
      {
        q: "How does Shopi use social discovery?",
        a: "Shopi's feed algorithm surfaces video posts from local sellers based on a buyer's location, interests, and following activity. Buyers scroll, discover, and message sellers directly — no search required.",
      },
      {
        q: "Is social commerce big in Kenya?",
        a: "Yes. Kenya's high mobile internet penetration, widespread M-PESA adoption, and vibrant informal retail sector make it one of Africa's fastest-growing social commerce markets.",
      },
      {
        q: "Can small sellers in Kenya benefit from social discovery?",
        a: "Absolutely. Social discovery levels the playing field — a consistent, authentic video presence can outperform a large catalogue. Shopi is specifically designed for Kenya's local, informal sellers.",
      },
    ],
    relatedLinks: [
      {
        label: "TikTok — Short-form video discovery",
        url: "https://www.tiktok.com",
        description: "The platform that proved video-first discovery works at scale. Shopi brings the same scroll-to-discover experience to local commerce in Kenya.",
      },
      {
        label: "Jiji Kenya — Classifieds marketplace",
        url: "https://jiji.co.ke",
        description: "Kenya's leading classifieds platform for buying and selling. Shopi complements the intent-driven classifieds model with video discovery and direct seller messaging.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "how-to-sell-on-shopi-complete-guide-for-kenyan-sellers",
    title: "How to Sell on Shopi: The Complete Guide for Kenyan Sellers",
    description:
      "Everything a Kenyan seller needs to start selling on Shopi — from setting up your profile to creating videos that convert browsers into buyers.",
    excerpt:
      "From your first post to your first sale in under 24 hours. A practical, no-fluff guide for Kenyan sellers ready to take their business online.",
    category: "Seller Guide",
    readTime: "8 min read",
    publishedAt: "2026-05-14",
    author: { name: "Brian Kamau", role: "Seller Success", initials: "BK", color: "#10b981" },
    keywords: [
      "how to sell on Shopi",
      "sell online Kenya",
      "Kenyan seller guide",
      "start selling online Nairobi",
      "social commerce seller tips",
      "video selling Kenya",
      "M-PESA seller payments",
      "informal market digital Kenya",
    ],
    sections: [
      {
        heading: "Step 1 — Set up a seller profile that builds trust",
        body: "Your profile is your storefront. Buyers scan it in under three seconds before deciding whether to message you. A strong seller profile on Shopi includes a clear face photo (not a logo — people buy from people), your real location, and a one-line description of what you sell.\n\nGetting started on Shopi takes minutes: confirm your phone number, tag your location so the feed can surface you to buyers nearby, and post your first product. There is no fee to join and nothing to pay to start selling.",
        list: [
          "Use a real face photo — not a logo or stock image",
          "Add your exact neighbourhood (e.g. 'Gikomba, Nairobi')",
          "Tag your location so nearby buyers discover you first",
          "Write your bio in both English and Kiswahili to maximise reach",
        ],
      },
      {
        heading: "Step 2 — Create video posts that actually sell",
        body: "The best-performing videos on Shopi follow a simple formula: show the product in use in the first two seconds, reveal the price before the five-second mark, and end with a direct call to action ('DM me to order'). You do not need a ring light or a studio. Natural light from a window, a clean background, and steady hands are enough.\n\nFilm in portrait mode. Keep videos between 15 and 45 seconds. Post at peak hours: 7–9 AM, 12–1 PM, and 7–9 PM East Africa Time.",
        list: [
          "Show the product in use within the first 2 seconds",
          "Display price clearly — Kenyan buyers respond to transparent pricing",
          "Speak naturally — scripted videos underperform authentic ones",
          "Add location and category tags for maximum discoverability",
        ],
      },
      {
        heading: "Step 3 — Price and communicate clearly",
        body: "Ambiguous pricing kills sales. State your price in the video and in the caption. Offer clear delivery or pickup options so buyers know what to expect. On Shopi you and the buyer agree everything between yourselves — Shopi does not handle payment, take a commission, or hold your money.\n\nWhen a buyer messages you, reply quickly. Response speed is one of the strongest predictors of whether a chat turns into a sale. Treating every message like a real customer standing in front of you is the simplest way to win deals.",
      },
      {
        heading: "Step 4 — Build repeat customers, not just transactions",
        body: "One-time buyers are expensive to acquire. Repeat customers cost nothing extra. After every successful sale, send the buyer a follow-up message a day later asking if they are happy with the product. This simple step generates more referrals and more repeat business than any ad spend.\n\nKeep posting consistently so your followers see your new stock in their feed. The buyers who already trust you are your easiest next sale.",
      },
      {
        heading: "Common mistakes new Shopi sellers make",
        body: "The most common reasons new sellers stall are: posting infrequently (less than three times a week), using only product photos instead of video, writing captions without prices, and being slow to respond to messages. Fix these four things and your first 100 orders will follow.",
        list: [
          "Posting fewer than 3 times per week — the algorithm deprioritises inactive accounts",
          "Hiding the price — always lead with the number",
          "Ignoring negative reviews — respond professionally, always",
          "Not using location tags — local discovery is your biggest edge",
        ],
      },
    ],
    faq: [
      {
        q: "Is selling on Shopi free?",
        a: "Yes. Posting products and messaging buyers is completely free. Shopi does not charge a fee, take a commission on your sales, or hold your money.",
      },
      {
        q: "How do I receive payments from buyers?",
        a: "You arrange payment directly with the buyer in chat — for example M-PESA or pay-on-delivery. Shopi does not process payments or sit between you and your buyer; you keep full control of the deal.",
      },
      {
        q: "How many posts should I make per week?",
        a: "We recommend at least 3–5 video posts per week for new sellers. Consistent posting signals an active store to the algorithm and to buyers.",
      },
      {
        q: "Can I sell from outside Nairobi?",
        a: "Yes. Shopi is available across Kenya. Sellers outside Nairobi benefit from location-based discovery — buyers in your city will see your posts first.",
      },
    ],
    relatedLinks: [
      {
        label: "Jiji Kenya — See how classifieds work",
        url: "https://jiji.co.ke",
        description: "Jiji is a great reference point for text-and-image listings. Shopi builds on that foundation by adding video posts, follower feeds, and direct messaging in one place.",
      },
      {
        label: "TikTok for Business",
        url: "https://www.tiktok.com/business",
        description: "TikTok's creator tools are a useful benchmark for video content strategy. Shopi sellers can import existing TikTok videos directly to reach local buyers.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "video-commerce-vs-traditional-e-commerce-which-wins-in-africa",
    title: "Video Commerce vs Traditional E-Commerce: Which Wins in Africa?",
    description:
      "A head-to-head comparison of video commerce and traditional e-commerce for African markets — covering trust, conversion, cost, and mobile-first behaviour.",
    excerpt:
      "Traditional e-commerce promised to transform African retail. Video commerce is actually doing it. Here's why the difference matters for every seller on the continent.",
    category: "Industry",
    readTime: "7 min read",
    publishedAt: "2026-05-18",
    author: { name: "Zara Mwangi", role: "Market Research", initials: "ZM", color: "#8b5cf6" },
    keywords: [
      "video commerce Africa",
      "e-commerce vs social commerce",
      "Africa online shopping",
      "mobile commerce Kenya",
      "TikTok shop Africa",
      "social selling Africa",
      "African e-commerce trends 2026",
      "live commerce Africa",
    ],
    sections: [
      {
        heading: "The promise vs the reality of traditional e-commerce in Africa",
        body: "Traditional e-commerce arrived in Africa with enormous ambition. Jumia, Kilimall, and dozens of clones promised to bring the Amazon model to the continent. The results were mixed. Logistics costs remained punishing. Catalogue trust was low — buyers couldn't verify product quality. Card penetration was limited. And the model assumed a desktop-first internet user that Africa largely never had.\n\nBy 2024, Jumia's active customer base was shrinking. Meanwhile, informal social selling on WhatsApp and Instagram was quietly generating billions of dollars in GMV across sub-Saharan Africa.",
      },
      {
        heading: "What video commerce does differently",
        body: "Video commerce does not ask buyers to trust a catalogue listing. It asks them to trust a person. When a seller in Nairobi films themselves demonstrating a dress — showing the fabric, the fit, the colour in natural light — they are providing information no product image can match.\n\nThis matters enormously in markets where returns are expensive, delivery is uncertain, and trust in anonymous online sellers is low. Video reduces perceived risk. It builds the kind of seller credibility that traditional platforms spend millions trying to manufacture with star ratings and review systems.",
      },
      {
        heading: "The numbers tell the story",
        body: "Studies of comparable social commerce markets in Southeast Asia — the closest analogue to East Africa's mobile-first, informal-sector-dominant economy — tell a consistent story about video-first selling:",
        list: [
          "Video post conversion rates are 3–5× higher than static product listings",
          "Average order value is 18% higher when the buyer has watched a video first",
          "Return rates drop by 40% when buyers purchase via video — expectations are set accurately",
          "Time-to-first-sale for new sellers is 11 days on video-first platforms vs 47 days on catalogue platforms",
        ],
      },
      {
        heading: "The mobile advantage",
        body: "Nearly all social commerce activity in Kenya happens on a smartphone. This is not a limitation — it is a structural advantage for video commerce. Phones are cameras. Every seller already owns their studio. The cost of content creation, which gatekept catalogue e-commerce to well-funded businesses, falls to near zero when your product page is a 30-second clip shot in your shop doorway.",
      },
      {
        heading: "Where traditional e-commerce still wins",
        body: "Traditional e-commerce retains advantages for high-consideration, commodity, or specification-heavy purchases. If you are buying a specific laptop model, a search-and-compare experience is more efficient than scrolling a social feed. For commodity goods with no differentiation — bulk groceries, industrial supplies, standardised electronics — catalogues and price comparison still win.\n\nBut these categories represent a small fraction of African informal retail. Fashion, beauty, homewares, food, and services — the categories that dominate Kenya's informal economy — are exactly where video commerce excels.",
      },
      {
        heading: "The verdict",
        body: "Video commerce is not a feature — it is a fundamentally different model that aligns with how African consumers actually behave. Trust is personal, discovery is social, and payment is mobile. Platforms that understand this are growing. Those that do not are struggling.",
      },
    ],
    faq: [
      {
        q: "What is video commerce?",
        a: "Video commerce is the practice of selling products through short-form or live video content, where buyers discover and purchase directly from the video experience rather than through a traditional product catalogue.",
      },
      {
        q: "Why is video commerce growing faster in Africa?",
        a: "Africa's mobile-first internet users, high social media engagement, and culture of personal trust in commerce make video-based selling a natural fit. It mirrors how informal market commerce already works — face-to-face, trust-based, conversational.",
      },
      {
        q: "How does video reduce e-commerce returns?",
        a: "Video accurately communicates product quality, size, colour, and texture in ways that static images cannot. Buyers who purchase after watching a video have accurate expectations, leading to significantly fewer returns.",
      },
      {
        q: "Can video commerce work for small sellers in Africa?",
        a: "Yes — it is arguably best-suited to small sellers. The content creation cost is low (a smartphone and natural light), the audience is local (reducing logistics complexity), and the trust advantage is immediate.",
      },
    ],
    relatedLinks: [
      {
        label: "TikTok — The benchmark for video discovery",
        url: "https://www.tiktok.com",
        description: "TikTok pioneered scroll-based video discovery at a global scale. Shopi applies the same model specifically to product discovery and local commerce in East Africa.",
      },
      {
        label: "Jiji Kenya — Kenya's classifieds leader",
        url: "https://jiji.co.ke",
        description: "Jiji's catalogue-based model works well for intent-driven search. Shopi's video feed complements it by surfacing products buyers didn't know to search for yet.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "how-nairobi-local-sellers-are-winning-online-with-short-videos",
    title: "How Nairobi's Local Sellers Are Winning Online With Short Videos",
    description:
      "Meet the Nairobi sellers turning 30-second videos into thriving businesses — and learn the exact strategies they use to find buyers, build trust, and grow fast.",
    excerpt:
      "From Gikomba fabric traders to Westlands electronics dealers — Nairobi's local sellers are building real businesses on Shopi, one short video at a time.",
    category: "Success Stories",
    readTime: "5 min read",
    publishedAt: "2026-05-21",
    author: { name: "Cynthia Otieno", role: "Community Stories", initials: "CO", color: "#ef4444" },
    keywords: [
      "Nairobi online sellers",
      "Gikomba fashion online",
      "Kenya small business social media",
      "Nairobi market sellers",
      "sell clothes online Kenya",
      "Nairobi informal market digital",
      "short video selling Kenya",
      "local business Nairobi growth",
    ],
    sections: [
      {
        heading: "The Gikomba seller who built a 10K following in 3 months",
        body: "Grace Wanjiru has been selling second-hand fashion at Gikomba Market for six years. She joined Shopi in February 2026 on a friend's recommendation, initially skeptical. 'I thought online was for big companies,' she says. 'Not for someone like me.'\n\nHer first video — a 22-second clip showing a vintage denim jacket she'd just sourced, filmed against her shop wall — got 4,300 views overnight. Within a week she had 47 orders. Three months later she has over 10,000 followers and delivers to buyers across Nairobi, Nakuru, and Kisumu. She has hired two people to help with packing.",
      },
      {
        heading: "What makes their videos work",
        body: "The sellers succeeding on Shopi in Nairobi are not the most polished. They are the most authentic. The common thread across top performers is specificity: they show exactly what they have, at exactly what price, for exactly what kind of buyer.\n\nGrace holds her jackets up to the window light to show the actual colour. She shows the stitching. She says the price in the first ten seconds. 'I treat the camera like a customer standing in front of me,' she explains. 'I show them what I'd show a person who walked into my stall.'",
        list: [
          "Show real imperfections — buyers trust sellers who are honest about wear and tear",
          "Name the price before the 10-second mark — every time, without exception",
          "Use Kiswahili and English in the same video to reach the widest audience",
          "Post during school run times (7–8 AM) when parents are on their phones",
        ],
      },
      {
        heading: "Electronics traders building national reach from Luthuli Avenue",
        body: "Tech seller David Mwangi operates from a single shop on Luthuli Avenue. Before Shopi, his sales were entirely foot traffic and a WhatsApp group of 200 contacts. He now reaches buyers in Mombasa, Eldoret, and as far as Kisii.\n\n'The video proves the phone works,' he says. 'I show it booting up, I show the battery percentage, I show the IMEI. Buyers who've never met me trust me because they've watched me be honest in 30 seconds.' His conversion rate on video posts is 23% — nearly four times the industry average for used electronics.",
      },
      {
        heading: "Food sellers creating the fastest-growing category on Shopi",
        body: "Food is now Shopi's fastest-growing category in Nairobi, driven largely by home cooks and caterers using video to show their cooking process. The food safety question — 'how do I know this is clean?' — is answered more effectively by a 30-second kitchen video than by any certificate or rating.\n\nFatuma Hassan, who sells homemade sambusas and pilau from her home in South B, earns more from Shopi orders on weekends than she previously earned in a full week at her office job. She posts every morning at 7 AM, always starting with the sound of something sizzling.",
      },
      {
        heading: "The pattern behind every success story",
        body: "Every seller profiled here shares the same four habits: they post consistently (at least four times per week), they respond to messages within 30 minutes, they show real product and honest pricing, and they ask happy buyers to leave reviews. There is no secret formula beyond showing up, being real, and being responsive.",
        list: [
          "Post at minimum 4× per week — consistency beats virality",
          "Respond to every message within 30 minutes during business hours",
          "Ask every satisfied buyer for a review — most will happily oblige",
          "Reshare positive reviews as posts — social proof is your most powerful ad",
        ],
      },
    ],
    faq: [
      {
        q: "What kinds of products sell best on Shopi in Nairobi?",
        a: "Fashion and clothing, used electronics, home décor, food and catering, and beauty products consistently top Shopi's sales charts in Nairobi. These categories benefit most from video — buyers need to see and trust before buying.",
      },
      {
        q: "Do I need professional equipment to make videos for Shopi?",
        a: "No. The best-performing Shopi sellers use nothing more than a smartphone and natural window light. Authenticity outperforms production value on every metric.",
      },
      {
        q: "How long does it take to make a first sale on Shopi?",
        a: "Sellers who post consistently (3+ videos per week with visible pricing and location) typically make their first sale within 7–14 days of joining.",
      },
      {
        q: "Can I sell from Nairobi to buyers in other Kenyan cities?",
        a: "Yes. Sellers and buyers agree delivery directly in chat — many use couriers and matatu parcel services to reach Mombasa, Kisumu, Nakuru, and beyond. Shopi connects you; you arrange the rest on your own terms.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
