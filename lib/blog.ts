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
    author: { name: "Shopi Team", role: "Editorial", initials: "S", color: "#f59e0b" },
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
        body: "In Kenya's social commerce landscape, proximity builds trust. Buyers want to know a seller is in Kiambu, not a warehouse in Guangzhou. They want to see a face, hear a voice, and talk to the actual person selling.\n\nSocial discovery feeds that surface local sellers first tap into a trust dynamic that no global marketplace can replicate. When you see your neighbour's favourite fashion vendor on your feed, the decision to buy is already half-made.",
        list: [
          "Location-tagged posts surface sellers near the buyer first",
          "Every post carries a real price and a real location",
          "Video shows the actual product — not a stock photo",
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
    author: { name: "Shopi Team", role: "Seller Guides", initials: "S", color: "#10b981" },
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
        body: "Your profile is your storefront. Buyers scan it in under three seconds before deciding whether to message you. A strong seller profile on Shopi includes a clear face photo (not a logo — people buy from people), your real location, and a one-line description of what you sell.\n\nGetting started on Shopi takes minutes: create your account, tag your location so the feed can surface you to buyers nearby, and post your first product. There is no fee to join and nothing to pay to start selling.",
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
        body: "The most common reasons new sellers stall are: posting infrequently (less than three times a week), using only product photos instead of video, writing captions without prices, and being slow to respond to messages. Fix these four things and your first deals will follow.",
        list: [
          "Posting fewer than 3 times per week — consistent sellers stay visible in the feed",
          "Hiding the price — always lead with the number",
          "Ignoring questions in chat — every reply is a chance to close a deal",
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
    author: { name: "Shopi Team", role: "Editorial", initials: "S", color: "#8b5cf6" },
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
        body: "Traditional e-commerce arrived in Africa with enormous ambition. Jumia, Kilimall, and dozens of clones promised to bring the Amazon model to the continent. The results were mixed. Logistics costs remained punishing. Catalogue trust was low — buyers couldn't verify product quality. Card penetration was limited. And the model assumed a desktop-first internet user that Africa largely never had.\n\nMeanwhile, informal social selling on WhatsApp and Instagram quietly thrived across sub-Saharan Africa — not because anyone built it a platform, but because it matched how people already buy and sell.",
      },
      {
        heading: "What video commerce does differently",
        body: "Video commerce does not ask buyers to trust a catalogue listing. It asks them to trust a person. When a seller in Nairobi films themselves demonstrating a dress — showing the fabric, the fit, the colour in natural light — they are providing information no product image can match.\n\nThis matters enormously in markets where returns are expensive, delivery is uncertain, and trust in anonymous online sellers is low. Video reduces perceived risk. It builds the kind of seller credibility that traditional platforms spend millions trying to manufacture with star ratings and review systems.",
      },
      {
        heading: "Why video-first selling converts",
        body: "Southeast Asia's social commerce boom — the closest analogue to East Africa's mobile-first, informal-sector-dominant economy — points to a consistent pattern: buyers act faster and with more confidence when a real person shows them a real product. The reasons are structural, not magic:",
        list: [
          "A video answers the questions a static listing leaves open — condition, size, colour, feel",
          "Seeing the seller on camera builds the personal trust that informal commerce runs on",
          "Accurate expectations mean fewer disputes and disappointed buyers after the deal",
          "A camera and good light are all a new seller needs to start — no catalogue, no studio",
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
    title: "How Nairobi's Local Sellers Can Win Online With Short Videos",
    description:
      "A practical playbook for Nairobi sellers — from Gikomba fashion to Luthuli Avenue electronics — on using 30-second videos to find buyers and build trust.",
    excerpt:
      "From Gikomba fabric traders to Luthuli Avenue electronics dealers — a practical playbook for taking a Nairobi stall online, one short video at a time.",
    category: "Seller Guide",
    readTime: "5 min read",
    publishedAt: "2026-05-21",
    author: { name: "Shopi Team", role: "Seller Guides", initials: "S", color: "#ef4444" },
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
        heading: "Your stall already has everything a video needs",
        body: "A Gikomba fashion trader flipping through today's sourcing, a Luthuli Avenue dealer booting up a phone to show it works, a South B home cook lifting the lid off a sufuria — these are the videos local buyers actually want to watch. Nothing about them requires a studio.\n\nThe sellers best placed to win online are the ones already doing the physical version of the pitch every day. A short video is the same pitch, recorded once, shown to every buyer who scrolls past.",
      },
      {
        heading: "What makes a selling video work",
        body: "Polish is not the goal — specificity is. Show exactly what you have, at exactly what price, for exactly the kind of buyer you want. Hold the jacket up to window light so the colour is honest. Show the stitching. Say the price early.\n\nA useful rule: treat the camera like a customer standing in front of you. Show them what you would show a person who walked into your stall.",
        list: [
          "Show real imperfections — buyers trust sellers who are honest about wear and tear",
          "Name the price early — every time, without exception",
          "Use Kiswahili and English in the same video to reach the widest audience",
          "Film in daylight — natural light shows true colour better than any filter",
        ],
      },
      {
        heading: "For electronics: prove it works on camera",
        body: "Used electronics live or die on trust. A video can carry proof a photo never could: the phone booting up, the battery percentage, the charging port doing its job. A buyer who has watched a device work for thirty seconds has far fewer reasons to hesitate.\n\nThat proof travels, too. A trader on Luthuli Avenue is no longer limited to foot traffic and a WhatsApp group — a clear, honest video can reach buyers well beyond the CBD, and the deal continues in chat.",
      },
      {
        heading: "Reaching buyers beyond your neighbourhood",
        body: "Shopi surfaces nearby posts first, so your first audience is the one that can reach you fastest — your estate, your side of town. But nothing stops a deal from travelling. Buyers and sellers agree delivery directly in chat, and Kenya already has the rails for it: boda couriers within the city, matatu and courier parcel services between towns.\n\nStart local, deliver further as trust and repeat buyers build up. You set the terms — Shopi stays out of the transaction.",
      },
      {
        heading: "The habits that compound",
        body: "There is no secret formula beyond showing up, being real, and being responsive. The playbook is short:",
        list: [
          "Post consistently — a steady rhythm beats a one-off viral clip",
          "Respond to messages quickly — speed is what turns a question into a deal",
          "Show real product and honest pricing in every post",
          "Repost your best videos to TikTok and WhatsApp status — meet buyers where they already scroll",
        ],
      },
    ],
    faq: [
      {
        q: "What kinds of products suit short-video selling in Nairobi?",
        a: "Fashion and clothing, used electronics, home décor, food and catering, and beauty products benefit most from video — these are categories where buyers need to see condition, colour, and quality before they commit.",
      },
      {
        q: "Do I need professional equipment to make videos for Shopi?",
        a: "No. A smartphone and natural window light are enough. Authentic, specific videos consistently do the job better than polished, generic ones.",
      },
      {
        q: "How do I start selling on Shopi from Nairobi?",
        a: "Create an account, add your location, and post a short video of something you are selling with a clear price. Posting is free, and buyers message you directly — see our complete seller guide for a step-by-step walkthrough.",
      },
      {
        q: "Can I sell from Nairobi to buyers in other Kenyan cities?",
        a: "Yes. Sellers and buyers agree delivery directly in chat — many use couriers and matatu parcel services to reach Mombasa, Kisumu, Nakuru, and beyond. Shopi connects you; you arrange the rest on your own terms.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "where-to-sell-used-items-in-kenya",
    title: "Where to Sell Used Items in Kenya: A Practical Guide",
    description:
      "Comparing the real options for selling second-hand items in Kenya — marketplaces, WhatsApp groups, social media and physical dealers — and when each one actually makes sense.",
    excerpt:
      "Not every selling channel suits every item. Here's an honest comparison of where Kenyans sell used goods, what each one costs you, and how to pick.",
    category: "Seller Guide",
    readTime: "9 min read",
    publishedAt: "2026-08-27",
    author: {
      name: "Shopi Team",
      role: "Seller Guides",
      initials: "S",
      color: "#3b82f6",
    },
    keywords: [
      "where to sell used items",
      "where to sell used items in Kenya",
      "sell second hand items Kenya",
      "where can I sell online",
      "sell used phones Kenya",
      "sell online Kenya",
      "buy and sell online in Kenya",
    ],
    sections: [
      {
        heading: "First, be honest about what you are selling",
        body: "The right channel depends far more on the item than on the platform's marketing. A used iPhone, a three-seater sofa and a 2013 Toyota Premio are three completely different sales, and treating them the same is why so many listings sit untouched for weeks.\n\nThree questions decide almost everything: how much is it worth, how far will a buyer travel for it, and how urgently do you need the money? A KES 3,000 kettle is not worth a cross-town trip for anyone. A KES 800,000 car is worth a buyer driving from Nakuru to Nairobi. Match the channel to the answer.",
        list: [
          "Low value, bulky — sell locally, to someone who can collect the same day",
          "High value, portable — widen the audience, because buyers will travel",
          "Urgent sale — price below the market range and say so plainly",
          "Niche or enthusiast item — go where that specific community already is",
        ],
      },
      {
        heading: "Online marketplaces",
        body: "Marketplaces are the default for a reason: buyers arrive already intending to buy, and search brings your listing to people you would never otherwise reach. This is where most second-hand items in Kenya should start.\n\nThe trade-off differs by platform. Some charge listing or promotion fees, some take a commission, and some insert themselves between you and the buyer. Before you list anywhere, check three things — what it costs you, whether you speak to the buyer directly, and who sets the final price. On Shopi, listing is free, there is no commission, and buyers message you directly, because a marketplace that takes a cut of a second-hand sofa sale is taking it from a margin that barely exists.",
      },
      {
        heading: "WhatsApp groups and status",
        body: "For low-value, fast-moving items, your WhatsApp contacts are genuinely one of the strongest channels in Kenya. Trust is already established, the buyer is usually nearby, and the sale can close in an afternoon.\n\nThe ceiling is low, though. Your reach is your contact list, status updates vanish in 24 hours, and there is no way for someone searching for exactly what you are selling to find you. Use it as a first pass for cheap items, not as your only plan for anything valuable.",
      },
      {
        heading: "Facebook and Instagram",
        body: "Social platforms work well when the item photographs well and the audience is browsing rather than searching — furniture, fashion, décor and beauty products do well here.\n\nThe weakness is intent. People on social feeds are not looking to buy, so you are interrupting rather than answering a need. Expect a lot of \"is this still available?\" messages that go nowhere, and expect to repost repeatedly as your listing sinks down the feed.",
      },
      {
        heading: "Physical dealers and second-hand shops",
        body: "Dealers give you speed and certainty. You walk in, you walk out with money, and the item is gone. For anyone who needs cash this week, that is worth something real.\n\nWhat it costs is the margin. A dealer has to resell at a profit, so expect meaningfully less than a private buyer would pay. This is a fair trade when you genuinely need speed, and a poor one when you have a few weeks to wait.",
      },
      {
        heading: "How to price a second-hand item in Kenya",
        body: "Do not start from what you paid. Start from what comparable items are being advertised for right now — same model, same age, roughly the same condition — and position yourself inside that range.\n\nIf you want a fast sale, price a little under the middle of the range and say the price is firm. If you can wait, price near the top and expect negotiation. What kills sales is pricing above the range with no explanation, because a buyer comparing five listings will simply skip yours.",
        list: [
          "Search current listings for the same item before you set a price",
          "Discount honestly for wear, missing accessories or repairs",
          "State clearly whether the price is negotiable",
          "Include the price — listings without one get far fewer genuine enquiries",
        ],
      },
      {
        heading: "The listing itself decides more than the channel",
        body: "Two identical items on the same platform sell at very different speeds, and the difference is almost always presentation. Good light, several angles, honest photos of any damage, and a description that answers the obvious questions before they are asked.\n\nA short video does more than any of these. It shows the item working, proves it exists, and removes the doubt that keeps a buyer from sending the first message. Sellers who post video consistently get more enquiries than sellers who post a single dim photograph — on any platform.",
      },
      {
        heading: "Staying safe",
        body: "Second-hand selling in Kenya works well, but the basics matter. Meet in a public place during daylight, ideally somewhere with people around. Confirm that payment has actually cleared into your account before the item leaves your hands — a screenshot is not payment. Be wary of anyone who wants to pay above your asking price, arrange a courier you did not choose, or move the conversation off-platform immediately.\n\nIf a deal feels wrong, it is fine to walk away. Another buyer will come.",
      },
    ],
    faq: [
      {
        q: "Where can I sell used items in Kenya?",
        a: "The main options are online marketplaces like Shopi, WhatsApp groups and status, Facebook and Instagram, and physical second-hand dealers. Marketplaces reach buyers who are actively searching, WhatsApp is fastest for cheap local items, social media suits visual products, and dealers offer speed in exchange for a lower price.",
      },
      {
        q: "What is the best place to sell second-hand items online in Kenya?",
        a: "For most items, an online marketplace where buyers search by category and location. Look for one that is free to list, takes no commission, and lets you message the buyer directly — on a second-hand sale, a commission comes straight out of a thin margin.",
      },
      {
        q: "How do I price a used item in Kenya?",
        a: "Search what comparable items are currently advertised for, then price inside that range. Go slightly below the middle for a fast sale, near the top if you can wait for the right buyer. Always include a price and say whether it is negotiable.",
      },
      {
        q: "Is it free to sell used items on Shopi?",
        a: "Yes. Listing on Shopi is free and Shopi takes no commission on sales. Shopi does not process payments or hold money, so whatever the buyer pays you is yours in full.",
      },
      {
        q: "How do I avoid scams when selling second-hand in Kenya?",
        a: "Meet in a public place in daylight, confirm payment has cleared in your account before handing over the item, and be cautious of buyers offering more than you asked or pushing for an unusual delivery arrangement. Keep the conversation on-platform until you are confident.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "how-to-sell-your-car-in-kenya-without-a-broker",
    title: "How to Sell Your Car in Kenya Without a Broker",
    description:
      "A step-by-step guide to selling your car privately in Kenya — pricing it correctly, writing the listing, handling viewings safely, and transferring ownership through NTSA TIMS.",
    excerpt:
      "Brokers take a cut and control the conversation. Here's how to price, list, show and transfer your car yourself — and what the trade-offs really are.",
    category: "Seller Guide",
    readTime: "11 min read",
    publishedAt: "2026-08-27",
    author: {
      name: "Shopi Team",
      role: "Seller Guides",
      initials: "S",
      color: "#ef4444",
    },
    keywords: [
      "sell my car Kenya",
      "sell car without broker Kenya",
      "how to sell a car in Kenya",
      "car logbook transfer Kenya",
      "NTSA TIMS transfer",
      "how much is my car worth Kenya",
      "sell car online Kenya",
    ],
    sections: [
      {
        heading: "What a broker actually does — and what it costs you",
        body: "A car broker finds you a buyer, handles the viewings, and often manages the paperwork. For someone with no time and no patience for tyre-kickers, that is a real service.\n\nWhat it costs is control and margin. The broker takes a commission or quietly adds a markup, so the money leaves your side of the deal. More subtly, the broker owns the conversation — you hear the buyer's objections second-hand, you do not know what was said about your car, and if the broker earns more on a different vehicle, yours is not the one being pushed. Selling privately means doing the work yourself and keeping the difference.",
      },
      {
        heading: "Step 1 — Work out what your car is actually worth",
        body: "Almost every private sale that stalls stalls on price. Owners anchor to what they paid, or to what they need, rather than to what the market is currently offering.\n\nThe honest method is comparison. Search current listings for your make, model, year and grade, and note the range. Then place yourself in it honestly: a car with a clean logbook in your name, full service history and no accident record sits near the top; one with a pending transfer, unclear history or visible damage sits near the bottom. Remember you are comparing against asking prices, and final prices are usually somewhat lower.",
        list: [
          "Compare same make, model, year and grade — not just the model name",
          "Adjust down for accident history, respray work or missing service records",
          "Adjust up for a clean logbook already in your name",
          "Decide before you advertise what your true walk-away figure is",
        ],
      },
      {
        heading: "Step 2 — Get the paperwork ready before you advertise",
        body: "Serious buyers ask about the logbook in the first or second message. If your answer is vague, they move on, because unclear ownership is the single biggest risk in a private car sale in Kenya.\n\nBefore you list, confirm the logbook is in your name with no outstanding financing, that you have your national ID and KRA PIN, and that your NTSA TIMS account is active. Ownership transfer happens through TIMS and both parties need working accounts, so a dormant account discovered on sale day will cost you the deal. Requirements and fees change, so check the current process on the NTSA TIMS portal rather than relying on what was true last year.",
      },
      {
        heading: "Step 3 — Write a listing that filters out time-wasters",
        body: "The goal of a car listing is not maximum enquiries. It is maximum enquiries from people who might actually buy. Vagueness attracts messages from everyone and buyers from no one.\n\nPut the year and grade in the title, not just the model. State the mileage, the price in KES, whether it is negotiable, and your location. Say plainly whether the logbook is ready. Then answer the obvious questions in the description — accident history, service records, why you are selling — because a buyer who has to ask five questions before learning anything usually does not ask any.",
        list: [
          "Title: make, model, year and grade",
          "Photos: exterior from all four corners, interior, dashboard with engine on, tyres, engine bay",
          "A short walkaround video, which converts better than photos alone",
          "Honest photos of any dents, scratches or interior wear",
          "Price, location, mileage, and logbook status stated up front",
        ],
      },
      {
        heading: "Step 4 — Handle viewings and test drives safely",
        body: "Meet in a public, busy place during daylight. Bring someone with you if you can. Ask to see the buyer's ID and driving licence before any test drive, and go along for the drive — never hand the keys to a stranger and wait.\n\nExpect and welcome an independent mechanic's inspection. A buyer who wants their own mechanic to look at the car is a serious buyer, and refusing reads as though you are hiding something. If your car is sound, an inspection closes the sale rather than threatening it.",
      },
      {
        heading: "Step 5 — Negotiate without giving away your position",
        body: "Almost every Kenyan car buyer will negotiate, so price with a little room and decide your walk-away figure in advance. The mistake is negotiating against yourself — dropping the price again before the buyer has responded to your last number.\n\nIf a buyer's offer is too low, say what you will accept and let it sit. Silence is a normal part of the process. And be cautious of anyone who agrees to your full asking price instantly without seeing the car, then asks for an unusual payment or shipping arrangement.",
      },
      {
        heading: "Step 6 — Take payment and transfer ownership",
        body: "Do not release the car until payment has actually cleared in your account. A screenshot, an SMS or a pending transfer notification is not payment. For a sum of this size, arrange to complete the transaction at a bank where the payment can be confirmed on the spot.\n\nSign a simple sale agreement recording both parties' details, the vehicle registration, the price and the date, and keep a copy. Then complete the transfer through NTSA TIMS. Until the transfer is done, the car is still legally yours — which means any offence committed in it is still your problem. Do not let this step drift.",
      },
      {
        heading: "When a broker is still the right call",
        body: "Selling privately is not free — it costs you time, several evenings of viewings, and the patience to deal with people who never intended to buy. If you are relocating in two weeks, or you simply do not want the process, a broker or a dealer buying outright is a legitimate choice.\n\nThe point is to make it a decision rather than a default. Know roughly what your car is worth privately, then decide whether the convenience is worth the difference. For many sellers it is not, and the gap is a significant amount of money for a few weekends of effort.",
      },
    ],
    faq: [
      {
        q: "Can I sell my car in Kenya without a broker?",
        a: "Yes. You can list the car yourself, deal with buyers directly and complete the ownership transfer through NTSA TIMS. You keep the commission a broker would have taken, in exchange for handling viewings and paperwork yourself.",
      },
      {
        q: "How much is my car worth in Kenya?",
        a: "Compare current listings for the same make, model, year and grade, and place your car inside that range based on condition, accident history, service records and logbook status. Remember those are asking prices — final prices are usually somewhat lower.",
      },
      {
        q: "What documents do I need to sell a car in Kenya?",
        a: "The logbook in your name with no outstanding financing, your national ID and KRA PIN, an active NTSA TIMS account, and a signed sale agreement. At transfer you also need copies of the buyer's ID and KRA PIN. Confirm the current requirements on the NTSA TIMS portal.",
      },
      {
        q: "How do I transfer car ownership in Kenya?",
        a: "Ownership transfer is done through the NTSA TIMS portal. Both buyer and seller need active TIMS accounts linked to their KRA PINs. The seller initiates the transfer and the buyer accepts it. Until the transfer completes, the vehicle remains legally yours.",
      },
      {
        q: "How do I avoid being scammed when selling my car?",
        a: "Confirm payment has cleared in your account before handing over the car or keys, ideally completing the transaction at a bank. Meet in public during daylight, verify the buyer's ID before a test drive, and be wary of anyone offering full asking price sight-unseen or pushing an unusual payment arrangement.",
      },
      {
        q: "Is it free to list my car on Shopi?",
        a: "Yes. Listing a car on Shopi is free and Shopi takes no commission. Buyers message you directly, and you agree price, inspection, payment and transfer between yourselves.",
      },
    ],
    relatedLinks: [
      {
        label: "NTSA — National Transport and Safety Authority",
        url: "https://www.ntsa.go.ke",
        description:
          "The official source for vehicle ownership transfer, TIMS accounts and current fees in Kenya. Always confirm the process here before transferring.",
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
