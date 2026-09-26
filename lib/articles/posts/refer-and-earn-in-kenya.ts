import type { Article } from "../types.ts";

/**
 * The public explainer for Invite & earn, written for "refer and earn in
 * Kenya" and the referral-programme searches around it.
 *
 * Every number here mirrors the programme terms in
 * shopi-social-commerce-api/src/modules/referral/referral.constants.ts:
 * KSh 200 per seller, 5 listings, a 14-day window to type a code in. Change
 * them there and they change in the app at once — this article has to be
 * edited by hand (and so does how-to-make-money-online-in-kenya-without-investment.ts).
 */
export const article: Article = {
  slug: "refer-and-earn-in-kenya",
  status: "published",
  intent: "insight",
  title: "Refer and Earn in Kenya: Get Paid on M-Pesa for Inviting Sellers",
  seoTitle: "Refer and Earn in Kenya: Get Paid on M-Pesa",
  seoDescription:
    "Refer and earn in Kenya with Shopi: invite a seller, and when they post 5 listings you get KSh 200 on M-Pesa. Free to join, no limit. Rules and tips.",
  excerpt:
    "Shopi's Invite & earn is a free way to refer and earn in Kenya: share your invite link, and for every seller who joins with it and posts 5 real listings, you get KSh 200 on M-Pesa. There is no fee to join and no limit on how many sellers you can invite.",
  primaryKeyword: "refer and earn in Kenya",
  keywords: [
    "referral programs in Kenya",
    "referral programmes in Kenya that pay",
    "earn money by referring friends in Kenya",
    "invite and earn Kenya",
    "apps that pay via M-Pesa",
    "Shopi referral",
  ],
  category: "earn",
  tags: ["earn-online", "referral", "selling"],
  author: "shopi-team",
  publishedAt: "2026-09-26",
  sections: [
    {
      id: "how-it-works",
      heading: "How Shopi's Invite & earn works",
      blocks: [
        {
          type: "p",
          text: "Most ways to refer and earn in Kenya pay you when a friend spends money. Shopi's pays you when a friend starts selling — because sellers with real listings are what make a marketplace worth visiting. Here is the whole process:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "**Open Invite & earn.** Sign in, go to your profile and tap **Invite & earn**. You'll see your personal invite link, a short invite code and how much you've earned so far.",
            "**Share your link.** Tap **Invite on WhatsApp** to send it straight to a chat or your status, or copy the link to share anywhere else.",
            "**Your friend signs up with the link** and starts posting what they have to sell. Posting is free for them, and Shopi takes no commission on their sales.",
            "**They post 5 listings.** You can watch each seller's progress — 2 of 5, 3 of 5 — in your **Your sellers** list.",
            "**You earn KSh 200 on M-Pesa.** The moment a seller you invited has 5 real listings live on Shopi, you've earned KSh 200 for them. The Shopi team sends it to your number and you get a notification with the M-Pesa transaction code.",
          ],
        },
        {
          type: "p",
          text: "Every seller earns you a separate reward, and there is no cap. One qualified seller earns KSh 200, three earn KSh 600, ten earn KSh 2,000. You don't have to wait for anyone else — each seller pays out on their own as soon as they reach 5 listings.",
        },
      ],
    },
    {
      id: "rules",
      heading: "Who counts as a qualified seller",
      blocks: [
        {
          type: "p",
          text: "The rules are short, and they exist so rewards go to people bringing real sellers rather than to anyone creating accounts. A seller you invite counts when all of these are true:",
        },
        {
          type: "checklist",
          items: [
            "They created their Shopi account through your invite link — or typed in your invite code within 14 days of signing up.",
            "It's a new account. Someone who already sells on Shopi can't be referred.",
            "They have 5 live listings: real items for sale that buyers can see on Shopi.",
            "Their account is in good standing with Shopi's [community guidelines](/community-guidelines).",
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "Every reward is checked before it's paid",
          text: "Accounts you create for yourself, listings copied from other sellers, or items nobody is actually selling don't count. If a seller is rejected after review, the reward for that seller is withdrawn if it hasn't been paid yet — your other sellers' rewards aren't affected.",
        },
        {
          type: "p",
          text: "Your **Your sellers** list shows each person who joined with your link and how many listings they have posted so far, so you can see who is one or two listings away from counting.",
        },
      ],
    },
    {
      id: "getting-paid",
      heading: "How you get paid on M-Pesa",
      blocks: [
        {
          type: "p",
          text: "Rewards are sent to M-Pesa, not held as points or app credit. Your Invite & earn screen shows the number rewards go to. It starts as the contact number on your listings, and you can change it to any Kenyan mobile number in your name.",
        },
        {
          type: "list",
          items: [
            "When a seller you invited posts their fifth listing, you get a notification that you've earned KSh 200, and the reward shows as **On its way**.",
            "The Shopi team reviews the sellers behind it and sends the money to your M-Pesa number.",
            "Once it's sent, you get a second notification with the M-Pesa transaction code, and the reward shows as **Paid** in your rewards list.",
          ],
        },
        {
          type: "p",
          text: "There is nothing to withdraw and no minimum balance to reach. You never need to give anyone your M-Pesa PIN or a verification code to receive a reward — Shopi will never ask for either.",
        },
      ],
    },
    {
      id: "who-to-invite",
      heading: "Who to invite (and what to say)",
      blocks: [
        {
          type: "p",
          text: "The best people to invite aren't simply your friends — they're people who already have things to sell. Think about:",
        },
        {
          type: "list",
          items: [
            "Friends and relatives clearing out phones, clothes, furniture or electronics they no longer use.",
            "Small shops, boutiques, salons and mitumba sellers who sell on WhatsApp status but not on a marketplace.",
            "Farmers and people selling produce, livestock or animal feed.",
            "Anyone relocating, upgrading or selling a car, a plot or household items.",
            "Students selling textbooks, gadgets or things they make.",
          ],
        },
        {
          type: "p",
          text: "Keep the message about them, not about your reward. Something like: \"I've started selling on Shopi — posting is free, there's no commission, and buyers message you directly. You could sell those shoes and the old phone. Here's my link.\" People join because it helps them; your KSh 200 follows.",
        },
      ],
    },
    {
      id: "where-to-share",
      heading: "Where to share your invite link",
      blocks: [
        {
          type: "p",
          text: "A link sent to the right person once does more than a link posted everywhere. The places that tend to work best:",
        },
        {
          type: "list",
          items: [
            "**One-to-one WhatsApp chats.** A personal message to someone you know has things to sell beats any broadcast. Mention the specific item: \"You could sell that fridge.\"",
            "**Your WhatsApp status.** Post a photo of something you've listed with your invite link underneath. People see that selling on Shopi works for someone they know.",
            "**Groups you already belong to** — chama, estate, church, alumni and family groups. Share once, with a short explanation, and answer questions; don't spam the group.",
            "**Local buy-and-sell groups.** People posting items there are already sellers, and many would welcome a free place with no commission.",
            "**In person.** Your 6-character invite code is easy to read out or write down, for anyone who'd rather type it in when they sign up.",
          ],
        },
        {
          type: "p",
          text: "Whichever you use, be honest about what Shopi is and isn't. Promising people they'll make money fast is the quickest way to lose their trust — and they'll share their own experience with the next person you invite.",
        },
      ],
    },
    {
      id: "help-them",
      heading: "Help your sellers reach 5 listings",
      blocks: [
        {
          type: "p",
          text: "Most invited sellers who stall do so after one or two listings — not because they have nothing else to sell, but because posting feels like work. A little help goes a long way:",
        },
        {
          type: "list",
          items: [
            "**Sit with them for 15 minutes** and photograph five items in one go, in daylight.",
            "**Show them Shopi Agent,** which drafts the title, description and details from a photo. See [what Shopi Agent does](/shopi-agent).",
            "**Point them to a guide.** Our [complete guide to selling on Shopi](/blog/how-to-sell-on-shopi-complete-guide-for-kenyan-sellers) covers pricing, photos and replying to buyers.",
            "**Celebrate their first sale.** A seller who sells something keeps posting — and tells other people.",
          ],
        },
        {
          type: "callout",
          tone: "tip",
          text: "Helping people sell is a way to earn in its own right. Many Kenyans take a small commission for listing and selling items for relatives and neighbours — and every one of those sellers who joins with your link and posts 5 listings earns you KSh 200 too. More ideas are in our guide to [how to make money online in Kenya without investment](/blog/how-to-make-money-online-in-kenya-without-investment).",
        },
      ],
    },
    {
      id: "real-vs-scam",
      heading: "Real referral programmes vs pay-to-join schemes",
      blocks: [
        {
          type: "p",
          text: "Search for referral programmes in Kenya and you'll find genuine ones next to schemes that only look like them. The differences are easy to check:",
        },
        {
          type: "table",
          caption: "How to tell a genuine referral programme from a pyramid scheme",
          head: ["", "Genuine referral programme", "Pay-to-join scheme"],
          rows: [
            ["Cost to join", "Free", "Registration or \"activation\" fee"],
            ["You're paid for", "People who actually use the service", "Recruiting people who also pay to join"],
            ["Money comes from", "The company", "New members' fees"],
            ["When recruiting slows", "Nothing changes", "Payments stop and latecomers lose their fee"],
          ],
        },
        {
          type: "p",
          text: "Shopi's Invite & earn is free, pays you for sellers who post real listings, and is paid by Shopi. If anything claiming to be a Shopi reward asks you for money, your PIN or a code sent to your phone, it isn't from us — report it through the [safety centre](/safety-centre).",
        },
      ],
    },
    {
      id: "earn-more",
      heading: "Referral rewards are a bonus — selling is the income",
      blocks: [
        {
          type: "p",
          text: "To be straightforward: KSh 200 per seller is a thank-you, not a salary. The people who get the most from Shopi sell things themselves and use Invite & earn on top — every seller they help onto Shopi is someone they might buy from, sell to or partner with later.",
        },
        {
          type: "p",
          text: "If you're starting from nothing, begin with the things you own. [Post an item for free](/upload), and see [online selling jobs in Kenya](/online-selling-jobs-kenya) for how people turn selling into steady work.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is Shopi's refer and earn free to join?",
      a: "Yes. Every Shopi account has an invite link in Invite & earn on the profile. There is no fee to join, and your invited sellers post for free too.",
    },
    {
      q: "How much can I earn from Shopi referrals?",
      a: "KSh 200 for every seller you invite who posts 5 listings, with no limit. Three qualified sellers earn KSh 600, ten earn KSh 2,000, and so on.",
    },
    {
      q: "Does my friend need to buy anything for me to earn?",
      a: "No. They need to create a new Shopi account through your link and post 5 real listings. Posting is free.",
    },
    {
      q: "What if my friend signed up without my link?",
      a: "They can still add your invite code from their own Invite & earn screen, within 14 days of creating their account. After that, the referral can't be added.",
    },
    {
      q: "Can I invite someone who already has a Shopi account?",
      a: "No. Only new accounts created through your link or code count, so existing sellers can't be referred.",
    },
    {
      q: "When do I get paid?",
      a: "As soon as a seller you invited has 5 live listings, the reward shows as On its way. The Shopi team reviews the seller and sends KSh 200 to your M-Pesa, and you're notified with the transaction code when it's sent.",
    },
  ],
  marketplaceLinks: [
    { kind: "page", path: "/upload", label: "Post an item for free" },
    { kind: "hub", path: "/sell-in-kenya" },
    { kind: "page", path: "/online-selling-jobs-kenya", label: "Online selling jobs in Kenya" },
  ],
  related: [
    "how-to-make-money-online-in-kenya-without-investment",
    "how-to-sell-on-shopi-complete-guide-for-kenyan-sellers",
    "where-to-sell-used-items-in-kenya",
  ],
  cta: {
    label: "Get your invite link",
    to: { kind: "page", path: "/profile?tab=invite", label: "Invite & earn" },
    text: "Open Invite & earn on your profile and share your link on WhatsApp. New to Shopi? You'll be asked to sign in first.",
  },
};
