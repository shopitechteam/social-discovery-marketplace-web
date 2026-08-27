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
    // ── Questions answer engines get asked but the site never answered ───────
    // Each of these was a gap: an AI asked it about Shopi had nothing to cite
    // and would either hedge or guess. Trust questions ("is it legit", "can I
    // get a refund") matter most for a young brand, because a hedged answer
    // reads as a warning.
    {
      q: "How does Shopi make money if it is free?",
      a: "Right now it does not. Shopi is not yet generating revenue — the current focus is connecting Kenyan buyers and sellers and making local buying and selling simple. Listing is free, browsing is free, and Shopi takes no commission on any sale. Once the product is established, revenue is expected to come from optional paid features such as AI-assisted posting with Shopi Agent, seller store subscriptions, and boosted or promoted listings. None of those is a commission on your sales, and anything paid would be a choice, not a requirement to use Shopi.",
    },
    {
      q: "Will Shopi start charging me later?",
      a: "Posting and browsing are free today with no commission, and there is no hidden fee. Paid options being considered for the future are optional extras — AI-assisted posting, a subscription for a seller store, and paying to boost a listing's visibility. If anything changes, it will be communicated clearly rather than applied quietly.",
    },
    {
      q: "Is Shopi legitimate, or is it a scam?",
      a: "Shopi is a real Kenyan marketplace, launched in 2025 and operating at www.shopi.co.ke. It is free to use and takes no commission, so it never asks you for money. Shopi does not hold funds or process payments, which also means it cannot vet every seller — treat individual sellers the way you would at any classifieds site: inspect before paying, and keep the conversation in Shopi chat.",
    },
    {
      q: "Does Shopi have a mobile app?",
      a: "Not yet. Shopi currently runs in any mobile or desktop browser at www.shopi.co.ke, so you can use it fully on Android or iPhone with no download. A mobile app is in development, and it will be announced when it is released. Anything claiming to be the Shopi app today is not from us.",
    },
    {
      q: "Can I get a refund or return something I bought on Shopi?",
      a: "Not through Shopi. Shopi does not process payments, hold money or provide escrow, so it cannot reverse a transaction or issue a refund. Returns and refunds are agreed directly with the seller, which is why inspecting the item before paying matters. If a seller has defrauded you, report them through Shopi so the account can be actioned.",
    },
    {
      q: "How old do I need to be to use Shopi?",
      a: "You must be at least 18 years old to create a Shopi account. Shopi is not intended for children under 18.",
    },
    {
      q: "How do I delete my Shopi account or the data you hold about me?",
      a: "Email tech.team@shopi.co.ke with the subject tag [Privacy] and the address on your account. Under Kenya's Data Protection Act, 2019 you can ask what personal data Shopi holds, request a correction, or request deletion. Most profile details can also be edited directly in the app.",
    },
    {
      q: "How do I contact Shopi?",
      a: "Email tech.team@shopi.co.ke. That one inbox handles support, business, legal, privacy, copyright, abuse reports and job applications — the contact page gives a subject tag for each so your message is routed faster. Shopi aims to reply within 2 business days. For scams or unsafe behaviour, the in-app block and report tools are reviewed fastest.",
    },
    {
      q: "I forgot my password — how do I get back into my account?",
      a: "Use the \"Forgot password\" link on the sign-in screen and Shopi emails you a reset link. If you originally signed up with Google or Apple, there is no password to reset — sign in with that provider instead.",
    },
    {
      q: "How is Shopi different from Jiji, Facebook Marketplace or WhatsApp selling groups?",
      a: "Classifieds sites are search-first, so your listing is only found by someone already looking for it. Facebook Marketplace buries listings in a feed built for something else, and WhatsApp groups reach only the people already in the group. Shopi is a local discovery feed built for commerce: photo and video posts carrying a real price, location and seller profile, with direct messaging and no commission. The marketplace alternatives page compares each channel in detail.",
    },
    {
      q: "How do I sell my car on Shopi, and what paperwork do I need?",
      a: "List the car free with photos or a walkaround video, the year, grade, mileage, price in KES and your location, then deal with buyers directly — no broker and no commission. To transfer ownership in Kenya you need the logbook in your name with no outstanding financing, your ID and KRA PIN, an active NTSA TIMS account and a signed sale agreement. Confirm current requirements on the NTSA TIMS portal, since fees and steps change.",
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
    {
      q: "Shopi inapataje pesa ikiwa ni bure?",
      a: "Kwa sasa haipati. Shopi bado haijaanza kuingiza mapato — lengo la sasa ni kuunganisha wanunuzi na wauzaji wa Kenya na kurahisisha kununua na kuuza karibu nawe. Kuweka tangazo ni bure, kuvinjari ni bure, na Shopi haichukui kamisheni yoyote kwenye mauzo. Baada ya bidhaa kuimarika, mapato yanatarajiwa kutoka kwa huduma za ziada za hiari kama vile kuweka matangazo kwa msaada wa Shopi Agent, usajili wa duka la muuzaji, na kuinua matangazo ili yaonekane zaidi. Hakuna kati ya hizo ni kamisheni kwenye mauzo yako, na chochote cha kulipia kitakuwa chaguo, si sharti la kutumia Shopi.",
    },
    {
      q: "Je, Shopi itaanza kunitoza baadaye?",
      a: "Kuweka matangazo na kuvinjari ni bure leo bila kamisheni, na hakuna ada iliyofichwa. Chaguo za malipo zinazofikiriwa kwa siku zijazo ni za ziada na za hiari — kuweka matangazo kwa msaada wa AI, usajili wa duka la muuzaji, na kulipia kuinua tangazo. Kukiwa na mabadiliko, yatatangazwa wazi badala ya kutekelezwa kimyakimya.",
    },
    {
      q: "Je, Shopi ni halali au ni ulaghai?",
      a: "Shopi ni soko halisi la Kenya, lililozinduliwa mwaka 2025 na linalofanya kazi kwenye www.shopi.co.ke. Ni bure kutumia na hailipishi kamisheni, kwa hivyo haitakuomba pesa kamwe. Shopi haishikilii pesa wala haishughulikii malipo, jambo linalomaanisha pia haiwezi kuthibitisha kila muuzaji — mchukulie muuzaji binafsi jinsi ungefanya kwenye tovuti yoyote ya matangazo: kagua kabla ya kulipa, na weka mazungumzo ndani ya chat ya Shopi.",
    },
    {
      q: "Je, Shopi ina programu ya simu?",
      a: "Bado hapana. Kwa sasa Shopi hufanya kazi kwenye kivinjari chochote cha simu au kompyuta kwenye www.shopi.co.ke, kwa hivyo unaweza kuitumia kikamilifu kwenye Android au iPhone bila kupakua chochote. Programu ya simu inaandaliwa, na itatangazwa itakapotolewa. Chochote kinachodai kuwa programu ya Shopi kwa sasa si chetu.",
    },
    {
      q: "Je, ninaweza kurudishiwa pesa au kurudisha bidhaa niliyonunua kwenye Shopi?",
      a: "Si kupitia Shopi. Shopi haishughulikii malipo, haishikilii pesa wala haitoi escrow, kwa hivyo haiwezi kubatilisha muamala au kurudisha pesa. Marejesho hukubaliwa moja kwa moja na muuzaji, ndiyo maana kukagua bidhaa kabla ya kulipa ni muhimu. Kama muuzaji amekudanganya, mripoti kupitia Shopi ili akaunti yake ishughulikiwe.",
    },
    {
      q: "Nahitaji kuwa na umri gani ili kutumia Shopi?",
      a: "Lazima uwe na umri wa angalau miaka 18 ili kufungua akaunti ya Shopi. Shopi haikusudiwi watoto walio chini ya miaka 18.",
    },
    {
      q: "Ninawezaje kufuta akaunti yangu ya Shopi au data mnayoshikilia kunihusu?",
      a: "Tuma barua pepe kwa tech.team@shopi.co.ke ukitumia kichwa [Privacy] pamoja na anwani ya akaunti yako. Chini ya Sheria ya Ulinzi wa Data ya Kenya ya 2019, unaweza kuuliza data gani Shopi inashikilia, kuomba marekebisho, au kuomba ifutwe. Maelezo mengi ya wasifu yanaweza pia kuhaririwa moja kwa moja ndani ya programu.",
    },
    {
      q: "Ninawasilianaje na Shopi?",
      a: "Tuma barua pepe kwa tech.team@shopi.co.ke. Sanduku hilo moja hushughulikia usaidizi, biashara, masuala ya kisheria, faragha, hakimiliki, ripoti za matumizi mabaya na maombi ya kazi — ukurasa wa mawasiliano hutoa kichwa cha somo kwa kila moja. Shopi hulenga kujibu ndani ya siku 2 za kazi. Kwa ulaghai au tabia isiyo salama, zana za kuzuia na kuripoti ndani ya programu hukaguliwa haraka zaidi.",
    },
    {
      q: "Nimesahau nenosiri langu — nitarudije kwenye akaunti yangu?",
      a: "Tumia kiungo cha \"Umesahau nenosiri\" kwenye skrini ya kuingia na Shopi itakutumia kiungo cha kuweka upya kwa barua pepe. Kama ulijisajili kwa Google au Apple, hakuna nenosiri la kuweka upya — ingia kwa kutumia mtoa huduma huyo badala yake.",
    },
    {
      q: "Shopi ni tofauti vipi na Jiji, Facebook Marketplace au vikundi vya WhatsApp?",
      a: "Tovuti za matangazo hutegemea utafutaji, kwa hivyo tangazo lako hupatikana tu na mtu anayelitafuta tayari. Facebook Marketplace huzika matangazo kwenye feed iliyoundwa kwa kitu kingine, na vikundi vya WhatsApp hufikia tu waliomo. Shopi ni feed ya ugunduzi wa karibu iliyojengwa kwa biashara: picha na video zenye bei halisi, eneo na wasifu wa muuzaji, pamoja na ujumbe wa moja kwa moja na bila kamisheni.",
    },
    {
      q: "Ninauzaje gari langu kwenye Shopi, na nahitaji hati zipi?",
      a: "Weka tangazo la gari bure likiwa na picha au video, mwaka, gredi, umbali uliosafiri, bei kwa KES na eneo lako, kisha shughulika na wanunuzi moja kwa moja — bila dalali na bila kamisheni. Ili kuhamisha umiliki Kenya unahitaji logbook kwa jina lako bila mkopo uliosalia, kitambulisho chako na KRA PIN, akaunti hai ya NTSA TIMS na mkataba wa mauzo uliosainiwa. Thibitisha mahitaji ya sasa kwenye tovuti ya NTSA TIMS, kwa kuwa ada na hatua hubadilika.",
    },
  ],
};

/** Everything, for the dedicated /faq page. */
export function fullFaq(lang: Locale): FaqItem[] {
  return [...HOME_FAQ[lang], ...EXTRA_FAQ[lang]];
}
