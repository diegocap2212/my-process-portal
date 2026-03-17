import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { WeeklyTrend } from "@/hooks/useDashboardData";
import { fontMono } from "@/styles/constants";

interface Props {
  data: WeeklyTrend[];
}

const LINES = [
  { key: "cone", label: "Cone", color: "hsl(222, 47%, 11%)" },
  { key: "pdti", label: "PDTI", color: "hsl(210, 40%, 30%)" },
  { key: "parado", label: "Parado", color: "hsl(0, 84%, 60%)" },
  { key: "wipEpic", label: "WIP Épicos", color: "hsl(280, 40%, 40%)" },
  { key: "wipUs", label: "WIP USs", color: "hsl(280, 30%, 55%)" },
];

const CheckpointChart: React.FC<Props> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div style={{
        padding: "30px 16px", textAlign: "center", color: "hsl(215.4 16.3% 46.9%)",
        fontSize: 12, background: "hsl(0 0% 100%)", borderRadius: 8, border: "1px solid hsl(214 31.8% 91.4%)",
        marginBottom: 20,
      }}>
        Precisa de pelo menos 2 semanas de dados para exibir o gráfico de evolução.
      </div>
    );
  }

  return (
    <div style={{
      padding: "16px", background: "hsl(0 0% 100%)", borderRadius: 8,
      border: "1px solid hsl(214 31.8% 91.4%)", marginBottom: 20,
    }}>
      <div style={{ ...fontMono, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "hsl(215.4 16.3% 46.9%)", marginBottom: 12 }}>
        EVOLUÇÃO SEMANAL — % CONFORMIDADE
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 31.8%, 91.4%)" />
          <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(215.4, 16.3%, 46.9%)" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(215.4, 16.3%, 46.9%)" />
          <Tooltip
            contentStyle={{
              background: "hsl(222.2, 84%, 4.9%)", border: "none", borderRadius: 6,
              color: "hsl(210, 40%, 98%)", fontSize: 11,
            }}
            formatter={(value: number) => [`${value}%`]}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {LINES.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CheckpointChart;
