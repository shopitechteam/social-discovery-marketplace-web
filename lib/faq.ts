import type { Locale } from "@/i18n/config";

/**
 * The canonical FAQ set.
 *
 * Shared by the homepage FAQ section and the dedicated /faq page so the two
 * can never drift — a page whose visible Q&A disagrees with its FAQPage
 * structured data is a rich-result violation. Answer engines cite consolidated,
 * well-structured Q&A more readily than prose, which is why this content is
 * worth keeping in one place and rendering in full.
 */
export type FaqItem = { q: string; a: string };

export const HOME_FAQ_EN: FaqItem[] = [
  {
    q: "What is Shopi?",
    a: "Shopi is Kenya's free social marketplace where people discover, buy and sell locally. Browse a personalized feed of nearby products, chat directly with buyers and sellers, or use Shopi Agent to make buying and selling faster and easier.",
  },
  {
    q: "What is Shopi Agent?",
    a: "Shopi Agent is your AI buying and selling assistant. It can turn a photo into a complete listing by generating titles, descriptions, categories and product details. It can also help buyers find products by understanding natural conversations instead of relying on exact search terms.",
  },
  {
    q: "Does Shopi handle payments or delivery?",
    a: "No. Shopi does not process payments, arrange delivery or take commission. Buyers and sellers agree directly on the price, payment method and delivery or pickup that works for them.",
  },
  {
    q: "How is Shopi different from other marketplaces?",
    a: "Shopi combines a personalized social feed with AI-powered assistance. Instead of only searching or filling long forms, you can discover products naturally, use Shopi Agent to create listings or find products, and connect directly with nearby buyers and sellers.",
  },
  {
    q: "How does Shopi personalize my feed?",
    a: "Your feed learns from what you view, save and message about. The more you use Shopi, the better it becomes at showing nearby products and categories that match your interests.",
  },
  {
    q: "What can I buy and sell on Shopi?",
    a: "Almost anything that can be bought and sold locally in Kenya, including cars, phones, electronics, fashion, furniture, home items, farm produce, livestock and much more.",
  },
  {
    q: "How do I post something for sale?",
    a: "You can post manually by adding photos or videos, or let Shopi Agent guide you through the process. Upload a photo, answer a few simple questions and Shopi Agent generates the title, description, category and other listing details for you.",
  },
  {
    q: "How do buyers and sellers communicate?",
    a: "Every listing includes built-in messaging so buyers and sellers can chat directly, ask questions, negotiate and agree on payment and delivery without leaving Shopi.",
  },
  {
    q: "Is Shopi free to use?",
    a: "Yes. It's free to browse, free to post and Shopi takes 0% commission on your sales. You keep every shilling you earn.",
  },
  {
    q: "Does Shopi work across Kenya?",
    a: "Yes. Shopi is built for local discovery across all 47 counties. Nearby listings are prioritized so you can find products close to you, while still being able to discover listings from other parts of Kenya.",
  },
];

export const HOME_FAQ: Record<Locale, FaqItem[]> = {
  en: HOME_FAQ_EN,
  sw: [
    {
      q: "Shopi ni nini?",
      a: "Shopi ni soko la kijamii la bure nchini Kenya ambapo unaweza kugundua, kununua na kuuza bidhaa karibu nawe. Vinjari feed iliyobinafsishwa ya bidhaa za karibu, wasiliana moja kwa moja na wanunuzi au wauzaji, au tumia Shopi Agent kufanya kununua na kuuza kuwa rahisi zaidi.",
    },
    {
      q: "Shopi Agent ni nini?",
      a: "Shopi Agent ni msaidizi wako wa AI wa kununua na kuuza. Inaweza kubadilisha picha kuwa tangazo kamili kwa kutengeneza kichwa, maelezo, kategoria na taarifa za bidhaa. Pia huwasaidia wanunuzi kupata bidhaa kwa kuelewa wanachotafuta kupitia mazungumzo ya kawaida.",
    },
    {
      q: "Je, Shopi inashughulikia malipo au usafirishaji?",
      a: "Hapana. Shopi haichakati malipo, haipangi usafirishaji wala haichukui commission. Mnunuzi na muuzaji hukubaliana moja kwa moja kuhusu bei, njia ya malipo na jinsi ya kuchukua au kusafirisha bidhaa.",
    },
    {
      q: "Shopi ni tofauti vipi na masoko mengine mtandaoni?",
      a: "Shopi inaunganisha feed ya kijamii na Shopi Agent. Badala ya kutegemea utafutaji pekee au kujaza fomu ndefu, unaweza kugundua bidhaa kwa urahisi, kutumia Shopi Agent kuunda tangazo au kutafuta bidhaa, na kuwasiliana moja kwa moja na watu walio karibu nawe.",
    },
    {
      q: "Shopi hupangaje feed yangu?",
      a: "Feed yako hujifunza kutokana na bidhaa unazofungua, kuhifadhi na kutuma ujumbe kuzihusu. Kadri unavyoendelea kutumia Shopi, ndivyo inavyoonyesha bidhaa za karibu zinazolingana zaidi na mambo unayopenda.",
    },
    {
      q: "Ninaweza kununua na kuuza nini kwenye Shopi?",
      a: "Unaweza kununua au kuuza karibu kila kitu kinachouzwa nchini Kenya, ikiwemo magari, simu, vifaa vya elektroniki, nguo, samani, bidhaa za nyumbani, mazao, mifugo na bidhaa nyingine nyingi.",
    },
    {
      q: "Je, Shopi inafanya kazi kote Kenya?",
      a: "Ndiyo. Shopi imejengwa kwa biashara za karibu katika kaunti zote 47 nchini Kenya. Bidhaa zilizo karibu nawe hupewa kipaumbele, lakini bado unaweza kugundua na kuwasiliana na wauzaji kutoka maeneo mengine nchini.",
    },
    {
      q: "Ninafunguaje akaunti ya Shopi?",
      a: "Nenda shopi.co.ke, gusa Sign in, kisha ujisajili kwa Google, Apple au barua pepe na nenosiri. Ni bure kujiunga na huhitaji biashara iliyosajiliwa ili kuanza kutumia Shopi.",
    },
    {
      q: "Ninawezaje kuweka bidhaa ya kuuza kwenye Shopi?",
      a: "Unaweza kutengeneza tangazo mwenyewe au kutumia Shopi Agent ikuongoze. Pakia picha au video, au zungumza na Shopi Agent, ambayo itakutengenezea kichwa, maelezo, kategoria na taarifa nyingine za bidhaa. Kuchapisha ni bure kabisa.",
    },
    {
      q: "Wanunuzi na wauzaji huwasilianaje kwenye Shopi?",
      a: "Kupitia mfumo wa chat uliopo ndani ya Shopi. Fungua tangazo na ugonge Message ili kuzungumza moja kwa moja na muuzaji au mnunuzi, kujadiliana bei na kukubaliana kuhusu malipo na usafirishaji bila kutoka kwenye Shopi.",
    },
    {
      q: "Je, kutumia Shopi ni bure?",
      a: "Ndiyo. Ni bure kuvinjari bidhaa, ni bure kuweka matangazo, na Shopi haichukui commission yoyote kwenye mauzo yako. Unabaki na kila shilingi unayopata.",
    },
  ],
};

/**
 * Questions that don't earn homepage space but are exactly what people (and
 * answer engines) ask: safety, account mechanics, what Shopi Agent will not do,
 * and geographic coverage. These render only on /faq.
 */
export const EXTRA_FAQ: Record<Locale, FaqItem[]> = {
  en: [
    {
      q: "Do I need an account to browse Shopi?",
      a: "No. You can browse the feed, explore listings and search without an account. You only need to sign in when you want to message a seller, save a listing or post something for sale.",
    },
    {
      q: "How do I create an account on Shopi?",
      a: "Sign up with Google, with an email address and password, or with Apple on Apple devices. You do not need a registered business, a website or a verified phone number to join.",
    },
    {
      q: "Is it safe to buy and sell on Shopi?",
      a: "Shopi keeps the conversation on the platform so you can ask questions before you commit. Meet in a public place, inspect the item before paying, and never send money before you have seen what you are buying. The Safety Centre covers this in more detail.",
    },
    {
      q: "What can Shopi Agent not do?",
      a: "Shopi Agent writes listings and helps you find products. It does not message sellers on your behalf, negotiate prices, or complete purchases. Every conversation and every deal stays between the buyer and the seller.",
    },
    {
      q: "Does Shopi chat happen on WhatsApp?",
      a: "No. Buyer and seller messaging happens inside Shopi's own chat. Shopi does not require or link a WhatsApp account.",
    },
    {
      q: "What items are not allowed on Shopi?",
      a: "Illegal goods, weapons, drugs, counterfeit products, live animals outside permitted livestock categories, and anything else covered by the Prohibited Items policy. Listings that breach it are removed.",
    },
    {
      q: "Which parts of Kenya does Shopi cover?",
      a: "All 47 counties. Nearby listings are surfaced first — from Nairobi, Mombasa, Kisumu, Nakuru, Eldoret and Meru to smaller towns — while good listings can still travel across the country.",
    },
    {
      q: "Can I use Shopi in Kiswahili?",
      a: "Yes. Shopi is available in both English and Kiswahili. Switch language from the menu, or visit any page under /sw.",
    },
  ],
  sw: [
    {
      q: "Je, ninahitaji akaunti ili kuvinjari Shopi?",
      a: "Hapana. Unaweza kuvinjari feed, kuchunguza matangazo na kutafuta bila akaunti. Unahitaji kuingia tu unapotaka kumtumia muuzaji ujumbe, kuhifadhi tangazo au kuweka bidhaa kuuza.",
    },
    {
      q: "Ninawezaje kufungua akaunti kwenye Shopi?",
      a: "Jisajili kwa Google, kwa barua pepe na nenosiri, au kwa Apple kwenye vifaa vya Apple. Huhitaji biashara iliyosajiliwa, tovuti wala nambari ya simu iliyothibitishwa.",
    },
    {
      q: "Je, ni salama kununua na kuuza kwenye Shopi?",
      a: "Shopi inaweka mazungumzo ndani ya jukwaa ili uweze kuuliza maswali kabla ya kuamua. Kutana mahali penye watu, kagua bidhaa kabla ya kulipa, na usitume pesa kabla ya kuona unachonunua.",
    },
    {
      q: "Shopi Agent haiwezi kufanya nini?",
      a: "Shopi Agent huandika matangazo na kukusaidia kupata bidhaa. Haimtumii muuzaji ujumbe kwa niaba yako, haijadiliani bei, wala haikamilishi manunuzi. Kila mazungumzo na kila dili hubaki kati ya mnunuzi na muuzaji.",
    },
    {
      q: "Je, mazungumzo ya Shopi hufanyika WhatsApp?",
      a: "Hapana. Mazungumzo kati ya mnunuzi na muuzaji hufanyika ndani ya chat ya Shopi yenyewe. Shopi haihitaji wala hauunganishi akaunti ya WhatsApp.",
    },
    {
      q: "Ni bidhaa zipi hazikubaliki kwenye Shopi?",
      a: "Bidhaa haramu, silaha, dawa za kulevya, bidhaa bandia, na chochote kinachoguswa na sera ya Bidhaa Zisizoruhusiwa. Matangazo yanayokiuka sera hiyo huondolewa.",
    },
    {
      q: "Shopi inahudumia sehemu zipi za Kenya?",
      a: "Kaunti zote 47. Matangazo ya karibu huonyeshwa kwanza — kutoka Nairobi, Mombasa, Kisumu, Nakuru, Eldoret na Meru hadi miji midogo — huku matangazo mazuri yakiweza kusafiri nchi nzima.",
    },
    {
      q: "Je, ninaweza kutumia Shopi kwa Kiswahili?",
      a: "Ndiyo. Shopi inapatikana kwa Kiingereza na Kiswahili. Badilisha lugha kwenye menyu, au tembelea ukurasa wowote chini ya /sw.",
    },
  ],
};

/** Everything, for the dedicated /faq page. */
export function fullFaq(lang: Locale): FaqItem[] {
  return [...HOME_FAQ[lang], ...EXTRA_FAQ[lang]];
}
