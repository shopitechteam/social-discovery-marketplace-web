/**
 * Referral rewards are paused. While this is true, an invite link — its page,
 * its title and the WhatsApp preview card — says so, instead of "X invited you
 * to sell on Shopi".
 *
 * To resume, set it to false. The profile still needs its paused components
 * swapped back by hand: ReferralPausedPanel → InviteEarnPanel in ProfileView,
 * and ReferralPausedBanner → the "Earn" row in ProfileMenu.
 */
export const REFERRALS_PAUSED = true;

export const REFERRALS_PAUSED_TITLE = "Shopi referrals are paused";

export const REFERRALS_PAUSED_BODY =
  "Referral rewards are on hold while we review content. You can still sell on Shopi for free.";
