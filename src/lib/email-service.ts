import nodemailer from 'nodemailer';

// Configuration SMTP - In a real production app, these should be in .env
// For this implementation, we prepare the structure to use process.env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const DEFAULT_RECIPIENTS = [
    'lkinkin@mrsholdings.com',
    'uagnoun@mrsholdings.com'
];

export async function sendStockAlertEmail(
    equipementNom: string,
    stockActuel: number,
    seuil: number,
    type: string
) {
    const subject = `🚨 ALERTE STOCK CRITIQUE : ${equipementNom}`;

    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #e53e3e;">Alerte de Niveau de Stock Bas</h2>
            <p>Le système SIGA a détecté que l'équipement suivant a franchi son seuil d'alerte :</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f7fafc;">
                    <td style="padding: 10px; border: 1px solid #edf2f7; font-weight: bold;">Équipement</td>
                    <td style="padding: 10px; border: 1px solid #edf2f7;">${equipementNom} (${type})</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #edf2f7; font-weight: bold;">Stock Actuel</td>
                    <td style="padding: 10px; border: 1px solid #edf2f7; color: #e53e3e; font-weight: bold;">${stockActuel.toLocaleString()} Litres</td>
                </tr>
                <tr style="background-color: #f7fafc;">
                    <td style="padding: 10px; border: 1px solid #edf2f7; font-weight: bold;">Seuil configuré</td>
                    <td style="padding: 10px; border: 1px solid #edf2f7;">${seuil.toLocaleString()} Litres</td>
                </tr>
            </table>
            
            <p>Merci de prendre les dispositions nécessaires pour le réapprovisionnement.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #718096;">Ceci est un message automatique généré par le Système SIGA.</p>
        </div>
    `;

    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("SMTP credentials not configured. Email skip (Log only):", subject);
            return { success: false, error: "SMTP not configured" };
        }

        await transporter.sendMail({
            from: `"Système SIGA" <${process.env.SMTP_USER}>`,
            to: DEFAULT_RECIPIENTS.join(','),
            subject,
            html,
        });

        console.log(`Stock alert email sent for ${equipementNom}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to send stock alert email:", error);
        return { success: false, error };
    }
}
