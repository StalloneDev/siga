"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    return await (prisma as any).notificationSysteme.findMany({
        where: { isRead: false },
        include: { equipement: true },
        orderBy: { createdAt: "desc" },
        take: 10
    });
}

export async function markAsRead(id: number) {
    await (prisma as any).notificationSysteme.update({
        where: { id },
        data: { isRead: true }
    });
    revalidatePath("/");
}

export async function clearAllNotifications() {
    await (prisma as any).notificationSysteme.updateMany({
        where: { isRead: false },
        data: { isRead: true }
    });
    revalidatePath("/");
}
