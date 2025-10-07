"use client";

import { useMemo, useState } from "react";
import Input from "@/components/Input";

function formatCurrency(n) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function MortgageBreakPenaltyCalculator() {
  const [balance, setBalance] = useState(300000);
  const [contractRate, setContractRate] = useState(5.0);
  const [comparisonRate, setComparisonRate] = useState(3.5);
  const [monthsRemaining, setMonthsRemaining] = useState(24);

  const results = useMemo(() => {
    const r = contractRate / 100;
    const threeMonthsInterest = balance * r * (3 / 12);
    const rateDiff = Math.max(0, (contractRate - comparisonRate) / 100);
    const ird = balance * rateDiff * (monthsRemaining / 12);
    const penalty = Math.max(threeMonthsInterest, ird);
    return { threeMonthsInterest, ird, penalty };
  }, [balance, contractRate, comparisonRate, monthsRemaining]);

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <h2 className="text-lg font-semibold">Mortgage Break Penalty</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input label="Mortgage balance" id="mbp-balance" type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
        <Input label="Contract rate (APR %)" id="mbp-rate" type="number" step="0.01" value={contractRate} onChange={(e) => setContractRate(Number(e.target.value))} />
        <Input label="Comparison rate (APR %)" id="mbp-comp" type="number" step="0.01" value={comparisonRate} onChange={(e) => setComparisonRate(Number(e.target.value))} />
        <Input label="Months remaining in term" id="mbp-months" type="number" value={monthsRemaining} onChange={(e) => setMonthsRemaining(Number(e.target.value))} />
      </div>
      <div className="mt-6 grid gap-2 text-sm">
        <div className="flex justify-between"><span>Three months interest</span><span className="font-medium">{formatCurrency(results.threeMonthsInterest)}</span></div>
        <div className="flex justify-between"><span>Interest rate differential (IRD)</span><span className="font-medium">{formatCurrency(results.ird)}</span></div>
        <div className="flex justify-between"><span>Estimated penalty</span><span className="font-semibold">{formatCurrency(results.penalty)}</span></div>
      </div>
    </div>
  );
}


