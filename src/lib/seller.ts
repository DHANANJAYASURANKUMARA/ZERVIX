import prisma from '@/lib/prisma';

export async function calculateSellerLevel(userId: string) {
    // Get stats
    const completedOrders = await prisma.order.count({
        where: {
            sellerId: userId,
            status: 'COMPLETED'
        }
    });

    const reviews = await prisma.review.findMany({
        where: {
            gig: {
                sellerId: userId
            }
        },
        select: {
            rating: true
        }
    });

    const avgRating = reviews.length > 0
        ? reviews.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / reviews.length
        : 0;

    const earningsResult = await prisma.order.aggregate({
        where: {
            sellerId: userId,
            status: 'COMPLETED'
        },
        _sum: {
            total: true
        }
    });

    const earnings = earningsResult._sum.total || 0;

    let level = 'New Seller';

    if (completedOrders >= 50 && avgRating >= 4.8 && earnings >= 2000) {
        level = 'Top Rated';
    } else if (completedOrders >= 20 && avgRating >= 4.5 && earnings >= 500) {
        level = 'Level 2';
    } else if (completedOrders >= 5 && avgRating >= 4.0 && earnings >= 100) {
        level = 'Level 1';
    }

    // Update user record
    await prisma.user.update({
        where: { id: userId },
        data: { sellerLevel: level }
    });

    return level;
}
