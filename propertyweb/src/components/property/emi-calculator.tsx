"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { Calculator } from "lucide-react";

/**
 * Simple EMI calculator for property detail pages.
 * Standard formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 * Shows monthly EMI, total interest, and total payable.
 */
export function EmiCalculator({ propertyPrice }: { propertyPrice: number }) {
  const [loanPercent, setLoanPercent] = useState(80);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const loanAmount = Math.round(propertyPrice * (loanPercent / 100));
  const downPayment = propertyPrice - loanAmount;

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    if (loanAmount <= 0 || interestRate <= 0 || tenureYears <= 0)
      return { emi: 0, totalInterest: 0, totalPayable: 0 };
    const r = interestRate / 100 / 12;
    const n = tenureYears * 12;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - loanAmount;
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
    };
  }, [loanAmount, interestRate, tenureYears]);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-base font-black tracking-tight">
        <Calculator className="size-5 text-primary" />
        EMI Calculator
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Estimate your monthly home loan payment.
      </p>

      <div className="mt-5 space-y-4">
        {/* Loan % slider */}
        <SliderField
          label="Loan amount"
          value={loanPercent}
          onChange={setLoanPercent}
          min={10}
          max={95}
          step={5}
          display={`${loanPercent}% — ${formatINR(loanAmount)}`}
        />

        {/* Interest rate */}
        <SliderField
          label="Interest rate"
          value={interestRate}
          onChange={setInterestRate}
          min={5}
          max={15}
          step={0.25}
          display={`${interestRate}% p.a.`}
        />

        {/* Tenure */}
        <SliderField
          label="Loan tenure"
          value={tenureYears}
          onChange={setTenureYears}
          min={1}
          max={30}
          step={1}
          display={`${tenureYears} years`}
        />
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border bg-surface p-4">
        <ResultItem label="Monthly EMI" value={formatINR(emi)} highlight />
        <ResultItem label="Down payment" value={formatINR(downPayment)} />
        <ResultItem label="Total interest" value={formatINR(totalInterest)} />
        <ResultItem label="Total payable" value={formatINR(totalPayable)} />
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        * Indicative. Actual EMI depends on bank, credit score, and processing fees.
      </p>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium text-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );
}

function ResultItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 text-sm font-bold tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
