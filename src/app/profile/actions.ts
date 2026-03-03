"use server";

import prisma from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateUserPassword(userId: number, currentPassword: string, newPassword: string) {
    try {
        const user = await prisma.utilisateur.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" };
        }

        // Vérifier l'ancien mot de passe
        const isValid = await compare(currentPassword, user.password);
        if (!isValid) {
            return { success: false, error: "L'ancien mot de passe est incorrect" };
        }

        // Hacher et mettre à jour le nouveau mot de passe
        const hashedPassword = await hash(newPassword, 12);
        await prisma.utilisateur.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la mise à jour du mot de passe:", error);
        return { success: false, error: "Erreur serveur" };
    }
}
