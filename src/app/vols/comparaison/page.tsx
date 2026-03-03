import { getDailyComparisons } from "./actions";
import ComparaisonClient from "./comparaison-client";

export default async function ComparaisonPage() {
    // Current date formatted as YYYY-MM-DD that matches input[type="date"]
    // By default, let's load today's comparison
    const initialDate = new Date().toISOString().split('T')[0];
    const initialComparisons = await getDailyComparisons(initialDate);

    return (
        <ComparaisonClient
            initialDate={initialDate}
            initialComparisons={initialComparisons}
        />
    );
}
