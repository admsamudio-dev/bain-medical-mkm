function parseBR(v: string) {
  // aceita "148,23" "148.23" "R$ 1.234,56"
  const cleaned = v
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI",
  "RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

type Props = {
  ufOrigem: string;
  setUfOrigem: (v: string) => void;
  ufDestino: string;
  setUfDestino: (v: string) => void;

  freteTexto: string;
  setFreteTexto: (v: string) => void;
  frete: number;
  setFrete: (v: number) => void;

  // impostos fixos (apenas mostrar)
  pis: number;
  cofins: number;
  irpj: number;
  csll: number;
};

export function ConfigFiscal({
  ufOrigem, setUfOrigem,
  ufDestino, setUfDestino,
  freteTexto, setFreteTexto,
  setFrete,
  pis, cofins, irpj, csll
}: Props) {
  return (
    <div style={{ marginTop: 20 }}>
      <h2>Configuração Fiscal</h2>

      {/* Aba / bloco: Estado que resido */}
      <div style={{ marginTop: 12 }}>
        <label><b>Estado que resido (Origem)</b></label><br />
        <select value={ufOrigem} onChange={(e) => setUfOrigem(e.target.value)}>
          {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      {/* Aba / bloco: Estado que vou mandar */}
      <div style={{ marginTop: 12 }}>
        <label><b>Estado de destino (Envio)</b></label><br />
        <select value={ufDestino} onChange={(e) => setUfDestino(e.target.value)}>
          {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      {/* Aba / bloco: Frete */}
      <div style={{ marginTop: 12 }}>
        <label><b>Frete (R$)</b> (pode deixar 0)</label><br />
        <input
          type="text"
          placeholder="Ex: 0 ou 148,23"
          value={freteTexto}
          onChange={(e) => {
            const v = e.target.value;
            setFreteTexto(v);
            setFrete(parseBR(v));
          }}
        />
      </div>

      {/* Impostos fixos (somente exibir) */}
      <p style={{ opacity: 0.8, marginTop: 16 }}>
        Impostos fixos: PIS {pis}% | COFINS {cofins}% | IRPJ {irpj}% | CSLL {csll}%
      </p>
    </div>
  );
}