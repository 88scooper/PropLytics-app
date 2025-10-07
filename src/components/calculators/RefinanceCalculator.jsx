"use client";

import { useMemo, useState } from "react";
import Input from "@/components/Input";

function formatCurrency(n) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function monthlyPayment(principal, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (principal <= 0 || r <= 0 || n <= 0) return 0;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

export default function RefinanceCalculator() {
  const [balance, setBalance] = useState(350000);
  const [remainingYears, setRemainingYears] = useState(20);
  const [currentRate, setCurrentRate] = useState(5.2);
  const [newRate, setNewRate] = useState(4.4);
  const [refiCost, setRefiCost] = useState(3000);

  const results = useMemo(() => {
    const currentPmt = monthlyPayment(balance, currentRate, remainingYears);
    const newPmt = monthlyPayment(balance, newRate, remainingYears);
    const monthlySavings = Math.max(0, currentPmt - newPmt);
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(refiCost / monthlySavings) : Infinity;
    const totalInterestCurrent = currentPmt * remainingYears * 12 - balance;
    const totalInterestNew = newPmt * remainingYears * 12 - balance;
    const interestSavings = Math.max(0, totalInterestCurrent - totalInterestNew);
    return { currentPmt, newPmt, monthlySavings, breakEvenMonths, interestSavings };
  }, [balance, remainingYears, currentRate, newRate, refiCost]);

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <h2 className="text-lg font-semibold">Refinance</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input label="Current balance" id="rc-balance" type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
        <Input label="Remaining amortization (years)" id="rc-years" type="number" value={remainingYears} onChange={(e) => setRemainingYears(Number(e.target.value))} />
        <Input label="Current rate (APR %)" id="rc-rate" type="number" step="0.01" value={currentRate} onChange={(e) => setCurrentRate(Number(e.target.value))} />
        <Input label="New rate (APR %)" id="rc-newrate" type="number" step="0.01" value={newRate} onChange={(e) => setNewRate(Number(e.target.value))} />
        <Input label="Refinance costs" id="rc-cost" type="number" value={refiCost} onChange={(e) => setRefiCost(Number(e.target.value))} />
      </div>
      <div className="mt-6 grid gap-2 text-sm">
        <div className="flex justify-between"><span>Current monthly payment</span><span className="font-medium">{formatCurrency(results.currentPmt)}</span></div>
        <div className="flex justify-between"><span>New monthly payment</span><span className="font-medium">{formatCurrency(results.newPmt)}</span></div>
        <div className="flex justify-between"><span>Monthly savings</span><span className="font-medium">{formatCurrency(results.monthlySavings)}</span></div>
        <div className="flex justify-between"><span>Break-even</span><span className="font-medium">{Number.isFinite(results.breakEvenMonths) ? `${results.breakEvenMonths} months` : "-"}</span></div>
        <div className="flex justify-between"><span>Interest savings (lifetime)</span><span className="font-medium">{formatCurrency(results.interestSavings)}</span></div>
      </div>
    </div>
  );
}


