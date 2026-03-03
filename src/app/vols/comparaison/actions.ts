"use server";

import prisma from "@/lib/prisma";

export interface CompanyComparison {
    companyId: number;
    companyName: string;
    forecasts: number;
    achievements: number;
    variances: number;
    ecartPercentage: number;
    comment: string;
}

export async function getDailyComparisons(dateStr: string): Promise<CompanyComparison[]> {
    try {
        const queryDate = new Date(dateStr);
        queryDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(queryDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // Fetch all flights for the selected date with their related company and refueling records
        const vols = await (prisma as any).programmeVol.findMany({
            where: {
                dateProgrammee: {
                    gte: queryDate,
                    lt: nextDate
                }
            },
            include: {
                compagnie: true,
                avitaillements: true,
            }
        });

        // Fetch user comments for this specific date
        const commentaires = await (prisma as any).commentaireComparaison.findMany({
            where: {
                date: queryDate
            }
        });
        const commentsMap = new Map<number, string>(commentaires.map((c: any) => [c.compagnieId, c.commentaire || ""]));

        // Group by company
        const companyMap = new Map<number, CompanyComparison>();

        for (const vol of vols) {
            const companyId = vol.compagnieId;
            const companyName = vol.compagnie.nom;

            // Forecast is defined on the flight program
            const forecast = vol.quantitePrevue || 0;

            // Achievement is the sum of all actual refueling operations for this flight
            const achievement = vol.avitaillements.reduce((sum: number, a: any) => sum + (a.quantiteLivree || 0), 0);

            if (companyMap.has(companyId)) {
                const existing = companyMap.get(companyId)!;
                existing.forecasts += forecast;
                existing.achievements += achievement;
            } else {
                companyMap.set(companyId, {
                    companyId,
                    companyName,
                    forecasts: forecast,
                    achievements: achievement,
                    variances: 0,
                    ecartPercentage: 0,
                    comment: commentsMap.get(companyId) || ""
                });
            }
        }

        // Calculate variances and Ecart %
        const result: CompanyComparison[] = Array.from(companyMap.values()).map(comp => {
            const variances = comp.achievements - comp.forecasts;
            let ecartPercentage = 0;
            if (comp.forecasts > 0) {
                // Formatting as integer percentage: (Achievements - Forecasts) / Forecasts
                ecartPercentage = Math.round((variances / comp.forecasts) * 100);
            } else if (comp.achievements > 0) {
                // If no forecast but there is achievement, technically infinite %, but let's cap it or just return 100%
                ecartPercentage = 100;
            }

            return {
                ...comp,
                variances,
                ecartPercentage,
            };
        });

        // Sort alphabetically by company name
        return result.sort((a, b) => a.companyName.localeCompare(b.companyName));

    } catch (error) {
        console.error("Erreur lors de la récupération des comparaisons:", error);
        return [];
    }
}

export async function saveComparisonComment(dateStr: string, compagnieId: number, comment: string) {
    try {
        const queryDate = new Date(dateStr);
        queryDate.setHours(0, 0, 0, 0);

        await (prisma as any).commentaireComparaison.upsert({
            where: {
                date_compagnieId: {
                    date: queryDate,
                    compagnieId: compagnieId
                }
            },
            update: {
                commentaire: comment
            },
            create: {
                date: queryDate,
                compagnieId: compagnieId,
                commentaire: comment
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du commentaire:", error);
        return { success: false, error: "Impossible de sauvegarder le commentaire" };
    }
}
