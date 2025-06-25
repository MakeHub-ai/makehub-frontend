import { useEffect, useState } from 'react';

export interface AggregatedChartRow {
  day: string; // YYYY-MM-DD
  model: string;
  total_tokens: number;
  total_cost: number;
  day_local?: string; // Ajouté dynamiquement côté frontend
}

export function useAggregatedDashboardData(period: '7days' | '30days' | '3months' = '30days') {
  const [data, setData] = useState<AggregatedChartRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Calculer la date de début selon la période (en local)
    const now = new Date();
    let startDate = new Date(now);
    if (period === '7days') startDate.setDate(now.getDate() - 7);
    if (period === '30days') startDate.setDate(now.getDate() - 30);
    if (period === '3months') startDate.setMonth(now.getMonth() - 3);

    // Pour inclure la journée locale courante, on ajoute 1 jour à end_date (car SQL <= end_date à minuit UTC)
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 1);

    const params = new URLSearchParams({
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
    });

    fetch(`/api/user/requests-aggregate?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        // Convertir chaque day (UTC) en date locale pour l'affichage
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localData = (json.data || []).map((row: AggregatedChartRow) => ({
          ...row,
          // On garde day en ISO pour la logique, mais on peut aussi ajouter une clé day_local si besoin
          day_local: new Date(row.day + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: tz }),
        }));
        setData(localData);
      })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [period]);

  return { data, isLoading, error };
}
