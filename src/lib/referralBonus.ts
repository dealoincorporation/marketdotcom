/**
 * Referral bonus: both referrer and referee receive ₦500 after the referee's first purchase.
 * Called from payment webhook and payment verify (idempotent via firstPurchaseBonusPaidAt).
 */

const REFERRAL_BONUS_AMOUNT = 500

// Schema has firstPurchaseBonusPaidAt; use this type until Prisma client is regenerated (npx prisma generate)
type ReferralWithBonusPaid = { id: string; firstPurchaseBonusPaidAt?: Date | null }

export type PrismaClient = Awaited<ReturnType<typeof import("@/lib/prisma").getPrismaClient>>

/**
 * Apply referral bonus (₦500 each to referrer and referee) when the buyer is a referee
 * and this is their first completed order. Safe to call from both webhook and verify.
 */
export async function applyReferralBonusOnFirstPurchase(
  prisma: PrismaClient,
  orderId: string
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { id: true, email: true, referredById: true } } }
  })

  if (!order || !order.user?.referredById) return

  const refereeId = order.user.id
  const referrerId = order.user.referredById

  const referral = await prisma.referral.findFirst({
    where: {
      referrerId,
      referredEmail: order.user.email
    }
  })

  if (!referral || (referral as ReferralWithBonusPaid).firstPurchaseBonusPaidAt) return

  // Only award on first completed order by this referee
  const completedCount = await prisma.order.count({
    where: {
      userId: refereeId,
      paymentStatus: "COMPLETED"
    }
  })

  if (completedCount !== 1) return

  const now = new Date()

  // Claim the bonus in one go so only one of webhook/verify can succeed (idempotent under concurrency)
  const updated = await prisma.referral.updateMany({
    where: {
      id: referral.id,
      ...({ firstPurchaseBonusPaidAt: null } as { firstPurchaseBonusPaidAt: null })
    },
    data: {
      firstPurchaseBonusPaidAt: now,
      rewardAmount: REFERRAL_BONUS_AMOUNT
    }
  })

  if (updated.count === 0) return // already paid by another request (e.g. webhook vs verify)

  const refReferrer = `ref-bonus-${referral.id}-referrer`
  const refReferee = `ref-bonus-${referral.id}-referee`

  await prisma.$transaction([
    prisma.user.update({
      where: { id: referrerId },
      data: { walletBalance: { increment: REFERRAL_BONUS_AMOUNT } }
    }),
    prisma.user.update({
      where: { id: refereeId },
      data: { walletBalance: { increment: REFERRAL_BONUS_AMOUNT } }
    }),
    prisma.walletTransaction.create({
      data: {
        userId: referrerId,
        type: "CREDIT",
        amount: REFERRAL_BONUS_AMOUNT,
        method: "referral_bonus",
        description: "Referral bonus – referred customer made first purchase",
        status: "COMPLETED",
        reference: refReferrer
      }
    }),
    prisma.walletTransaction.create({
      data: {
        userId: refereeId,
        type: "CREDIT",
        amount: REFERRAL_BONUS_AMOUNT,
        method: "referral_bonus",
        description: "Referral bonus – first purchase as referred customer",
        status: "COMPLETED",
        reference: refReferee
      }
    }),
    prisma.notification.create({
      data: {
        userId: referrerId,
        title: "Referral bonus credited",
        message: `You received ₦${REFERRAL_BONUS_AMOUNT} because someone you referred completed their first purchase.`,
        type: "REFERRAL"
      }
    }),
    prisma.notification.create({
      data: {
        userId: refereeId,
        title: "Referral bonus credited",
        message: `You received ₦${REFERRAL_BONUS_AMOUNT} bonus for your first purchase as a referred customer.`,
        type: "REFERRAL"
      }
    })
  ])
}
