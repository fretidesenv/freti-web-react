import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const kpis = [
  { title: "Lead Time Médio", value: "3.2 dias" },
  { title: "Deploys por Semana", value: "12" },
  { title: "MTTR", value: "45 min" },
  { title: "Taxa de Falhas em Produção", value: "4%" },
];

const userStats = [
  { name: "Jan", users: 120 },
  { name: "Feb", users: 180 },
  { name: "Mar", users: 210 },
  { name: "Apr", users: 260 },
  { name: "May", users: 320 },
  { name: "Jun", users: 400 },
];

export default function CtoDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel do CTO</h1>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tecnica">Indicadores Técnicos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.title}>
                <CardContent className="p-4">
                  <h2 className="text-sm font-medium text-muted-foreground">{kpi.title}</h2>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tecnica">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Deploys por Semana</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStats}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Usuários Ativos</h2>
                <Progress value={80} />
                <p className="text-sm text-muted-foreground">+320 usuários ativos</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Total na Base</h2>
                <p className="text-2xl font-bold">1.230</p>
              </div>
              <Button>Exportar Relatório</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}