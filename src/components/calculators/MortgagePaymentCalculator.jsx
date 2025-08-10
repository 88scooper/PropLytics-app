"use client";

import { useMemo, useState } from "react";
import Input from "@/components/Input";

function formatCurrency(n) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function MortgagePaymentCalculator() {
  const [price, setPrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(25);

  const results = useMemo(() => {
    const principal = Math.max(0, Number(price) - Number(downPayment));
    const monthlyRate = Number(rate) / 100 / 12;
    const n = Number(years) * 12;
    if (principal <= 0 || monthlyRate <= 0 || n <= 0) return { payment: 0, totalInterest: 0, totalCost: 0 };
    const factor = Math.pow(1 + monthlyRate, n);
    const payment = (principal * monthlyRate * factor) / (factor - 1);
    const totalCost = payment * n;
    const totalInterest = totalCost - principal;
    return { payment, totalInterest, totalCost, principal };
  }, [price, downPayment, rate, years]);

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <h2 className="text-lg font-semibold">Mortgage Payment</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input label="Home price" id="mpc-price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        <Input label="Down payment" id="mpc-down" type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
        <Input label="Interest rate (APR %)" id="mpc-rate" type="number" value={rate} step="0.01" onChange={(e) => setRate(Number(e.target.value))} />
        <Input label="Amortization (years)" id="mpc-years" type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
      </div>
      <div className="mt-6 grid gap-2 text-sm">
        <div className="flex justify-between"><span>Principal</span><span className="font-medium">{formatCurrency(results.principal || 0)}</span></div>
        <div className="flex justify-between"><span>Monthly payment</span><span className="font-medium">{formatCurrency(results.payment)}</span></div>
        <div className="flex justify-between"><span>Total interest</span><span className="font-medium">{formatCurrency(results.totalInterest)}</span></div>
        <div className="flex justify-between"><span>Total cost</span><span className="font-medium">{formatCurrency(results.totalCost)}</span></div>
      </div>
    </div>
  );
}


