import { useState } from "react";

type Tab = "config" | "calculo";

export function Tabs({
  onChange,
}: {
  onChange: (tab: Tab) => void;
}) {
  const [active, setActive] = useState<Tab>("config");

  function select(tab: Tab) {
    setActive(tab);
    onChange(tab);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => select("config")}>
        Configuração Fiscal
      </button>

      <button
        style={{ marginLeft: 10 }}
        onClick={() => select("calculo")}
      >
        Cálculo MKM
      </button>

      <span style={{ marginLeft: 12, opacity: 0.7 }}>
        Aba atual: {active}
      </span>
    </div>
  );
}
