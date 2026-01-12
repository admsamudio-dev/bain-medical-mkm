import { useMemo, useState } from "react";

const MKM_OPTIONS = [10, 15, 20, 30] as const;

// Fixed taxes (Ale defaults)
const PIS = 0.65;
const COFINS = 3;
const IRPJ = 1.2;
const CSLL = 1.08;

// UF lists
const UF_ALL = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR",
  "PE","PI","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
] as const;

// Option A (common rule)
// 12%: Sul/Sudeste (except ES) => PR, RS, SC, SP, RJ, MG
const ICMS_12 = ["PR", "RS", "SC", "SP", "RJ", "MG"] as const;

// 7%: Norte/Nordeste/CO + ES
const ICMS_7 = UF_ALL.filter((uf) => !(ICMS_12 as readonly string[]).includes(uf)) as readonly string[];

// 4%: usually for imported goods (when applicable). We'll show as a helper group.
const ICMS_4 = ["(Imported goods rule)"] as const;

// Accepts: "148,23" "148.23" "R$ 1.234,56" "1 234,56"
function parseBR(v: string): number {
  const cleaned = (v ?? "")
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")      // remove thousand separator
    .replace(",", ".");      // decimal comma -> dot
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function moneyBRL(v: number) {
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pctLabel(list: readonly string[]) {
  return list.join(", ");
}

export function CalculoMKM() {
  // Inputs as text to allow comma typing
  const [costText, setCostText] = useState("0,00");
  const [freightText, setFreightText] = useState("0,00");
  const [icmsText, setIcmsText] = useState("12"); // user can change, can be 0
  const [mkm, setMkm] = useState<(typeof MKM_OPTIONS)[number]>(15);

  const [destUF, setDestUF] = useState<(typeof UF_ALL)[number]>("SC");

  const cost = parseBR(costText);
  const freight = parseBR(freightText);
  const icms = parseBR(icmsText);

  const suggestedIcms = useMemo(() => {
    if ((ICMS_12 as readonly string[]).includes(destUF)) return 12;
    return 7; // includes ES + North/Northeast/Center-West
  }, [destUF]);

  const values = useMemo(() => {
    const base = cost + freight;

    const totalPerc = icms + PIS + COFINS + IRPJ + CSLL + mkm;
    const denom = 1 - totalPerc / 100;

    if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(denom) || denom <= 0) {
      return {
        sale: NaN,
        icmsV: NaN,
        pisV: NaN,
        cofinsV: NaN,
        irpjV: NaN,
        csllV: NaN,
        totalTaxes: NaN,
        mkmV: NaN,
        grossProfit: NaN,
        base: base,
      };
    }

    // Correct model: base (cost + freight) is what remains after taxes + MKM, so:
    // sale * (1 - (taxes+mkm)/100) = base  =>  sale = base / denom
    const sale = base / denom;

    const icmsV = sale * (icms / 100);
    const pisV = sale * (PIS / 100);
    const cofinsV = sale * (COFINS / 100);
    const irpjV = sale * (IRPJ / 100);
    const csllV = sale * (CSLL / 100);
    const mkmV = sale * (mkm / 100);

    const totalTaxes = icmsV + pisV + cofinsV + irpjV + csllV;

    return {
      sale,
      icmsV,
      pisV,
      cofinsV,
      irpjV,
      csllV,
      totalTaxes,
      mkmV,
      grossProfit: mkmV, // in this model, profit target = MKM value
      base,
    };
  }, [cost, freight, icms, mkm]);

  return (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <h1>App Bain Medical Brazil – MKM</h1>
      <h2>MKM Calculation</h2>

      <div style={{ marginTop: 14 }}>
        <label><b>Destination (UF)</b></label><br />
        <select value={destUF} onChange={(e) => setDestUF(e.target.value as any)}>
          {UF_ALL.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>

        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Suggested ICMS (SC → {destUF}): <b>{suggestedIcms}%</b> (you can override)
        </p>
      </div>

      <div style={{ marginTop: 14 }}>
        <label><b>Cost (BRL)</b></label><br />
        <input
          value={costText}
          onChange={(e) => setCostText(e.target.value)}
          placeholder="e.g. 5863,00"
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <label><b>Freight (BRL)</b></label><br />
        <input
          value={freightText}
          onChange={(e) => setFreightText(e.target.value)}
          placeholder="e.g. 10,23"
        />
        <p style={{ marginTop: 6, opacity: 0.7 }}>Leave 0 if not applicable.</p>
      </div>

      <div style={{ marginTop: 14 }}>
        <label><b>ICMS (%)</b></label><br />
        <input
          value={icmsText}
          onChange={(e) => setIcmsText(e.target.value)}
          placeholder="e.g. 12 (or 0)"
        />

        {/* Mural */}
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>ICMS quick reference (SC → other UFs)</div>

          <div style={{ marginBottom: 8 }}>
            <b>12%</b> → {pctLabel(ICMS_12)}
          </div>

          <div style={{ marginBottom: 8 }}>
            <b>7%</b> → {pctLabel(ICMS_7)}
          </div>

          <div style={{ opacity: 0.8 }}>
            <b>4%</b> → Imported goods rule (when applicable)
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setIcmsText(String(suggestedIcms))}>
              Set ICMS to {suggestedIcms}%
            </button>
            <button type="button" onClick={() => setIcmsText("0")}>
              Set ICMS to 0%
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label><b>MKM (%)</b></label><br />
        <select value={mkm} onChange={(e) => setMkm(Number(e.target.value) as any)}>
          {MKM_OPTIONS.map((x) => (
            <option key={x} value={x}>{x}%</option>
          ))}
        </select>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <p><b>Sale price:</b> {moneyBRL(values.sale)}</p>

      <p>ICMS: {moneyBRL(values.icmsV)}</p>
      <p>PIS: {moneyBRL(values.pisV)}</p>
      <p>COFINS: {moneyBRL(values.cofinsV)}</p>
      <p>IRPJ: {moneyBRL(values.irpjV)}</p>
      <p>CSLL: {moneyBRL(values.csllV)}</p>

      <p style={{ marginTop: 14 }}>
        <b>Total taxes:</b> {moneyBRL(values.totalTaxes)}
      </p>

      <p style={{ marginTop: 10 }}>
        <b>MKM (BRL):</b> {moneyBRL(values.mkmV)}
      </p>

      <p style={{ marginTop: 10 }}>
        <b>Approx. gross profit:</b> {moneyBRL(values.grossProfit)}
      </p>

      <p style={{ opacity: 0.7, marginTop: 14 }}>
        Fixed taxes: PIS {PIS}% | COFINS {COFINS}% | IRPJ {IRPJ}% | CSLL {CSLL}%
      </p>
    </div>
  );
}