import prisma from './prisma';
import { sendStockAlertEmail } from './email-service';

/**
 * Verifies if an equipment's stock is below its alert threshold.
 * If below, creates a system notification and sends an email.
 */
export async function checkStockAlert(equipementId: number) {
    try {
        // 1. Get equipment details and its current theoretical stock
        const equipement = await prisma.equipementStockage.findUnique({
            where: { id: equipementId },
            include: {
                mouvements: {
                    orderBy: { dateMouvement: 'desc' },
                    take: 1
                }
            }
        });

        if (!equipement || !(equipement as any).seuilAlerte) return;

        // Calculate current stock from movements (or stockInitial if no movements)
        // In this app, we might need a more robust calculation depending on how stock is tracked
        // Let's assume there is a utility to get current stock or we calculate it here.
        // For now, let's trigger it based on the logic that this function is called AFTER a movement.

        // Calculate current stock: Initial + (Inflows - Outflows)
        const [inflows, outflows] = await Promise.all([
            prisma.mouvementStock.aggregate({
                where: {
                    equipementId: equipement.id,
                    typeMouvement: { in: ['RECEPTION', 'TRANSFERT_ENTREE', 'AJUSTEMENT'] }
                },
                _sum: { quantite: true }
            }),
            prisma.mouvementStock.aggregate({
                where: {
                    equipementId: equipement.id,
                    typeMouvement: { in: ['AVITAILLEMENT', 'TRANSFERT_SORTIE'] }
                },
                _sum: { quantite: true }
            })
        ]);

        const totalIn = inflows._sum.quantite || 0;
        const totalOut = outflows._sum.quantite || 0;
        const currentStock = (equipement.stockInitial || 0) + totalIn - totalOut;

        if (currentStock <= (equipement as any).seuilAlerte) {
            const message = `Alerte : Le stock de ${equipement.nom} est de ${currentStock.toLocaleString()}L (Seuil: ${(equipement as any).seuilAlerte.toLocaleString()}L)`;

            // 2. Create System Notification (avoid duplicates within the last hour)
            const recentNotification = await (prisma as any).notificationSysteme.findFirst({
                where: {
                    equipementId: equipementId,
                    createdAt: {
                        gt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour
                    }
                }
            });

            if (!recentNotification) {
                await (prisma as any).notificationSysteme.create({
                    data: {
                        message,
                        type: currentStock <= ((equipement as any).seuilAlerte / 2) ? 'critical' : 'warning',
                        equipementId: equipement.id,
                    }
                });

                // 3. Send Email
                await sendStockAlertEmail(
                    equipement.nom,
                    currentStock,
                    (equipement as any).seuilAlerte,
                    equipement.typeEquipement
                );
            }
        }
    } catch (error) {
        console.error("Error in checkStockAlert:", error);
    }
}
