"use server";

import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    try {
        const users = await (prisma as any).utilisateur.findMany({
            orderBy: { nom: "asc" },
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                profil: true,
                actif: true,
                createdAt: true,
            }
        });
        return users;
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        return [];
    }
}

export async function createUser(formData: FormData) {
    const nom = formData.get("nom") as string;
    const prenom = formData.get("prenom") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const profil = formData.get("profil") as any;

    if (!nom || !prenom || !email || !password || !profil) {
        return { error: "Tous les champs sont requis" };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await (prisma as any).utilisateur.create({
            data: {
                nom,
                prenom,
                email,
                password: hashedPassword,
                profil,
                actif: true,
            }
        });

        revalidatePath("/users");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Cet email est déjà utilisé" };
        }
        console.error("Erreur lors de la création de l'utilisateur:", error);
        return { error: "Une erreur est survenue lors de la création" };
    }
}

export async function toggleUserStatus(id: number, currentStatus: boolean) {
    try {
        await (prisma as any).utilisateur.update({
            where: { id },
            data: { actif: !currentStatus }
        });
        revalidatePath("/users");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la modification du statut:", error);
        return { error: "Erreur lors de la modification" };
    }
}
