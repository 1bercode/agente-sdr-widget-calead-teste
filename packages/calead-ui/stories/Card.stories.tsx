import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardTitle } from "../src/components/Card";
import { Badge } from "../src/components/Badge";
import { Button } from "../src/components/Button";

const meta: Meta<typeof Card> = {
  title: "Calead/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const AgentListItem: Story = {
  render: () => (
    <Card className="w-[480px] hover:border-calead-accent">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-900">Widget NomoStudio</p>
          <p className="text-sm text-slate-500">https://nomostudio.com.br</p>
        </div>
        <Badge variant="success">site lido</Badge>
      </div>
    </Card>
  ),
};

export const FormSection: Story = {
  render: () => (
    <Card className="w-[560px] space-y-4">
      <CardTitle>Novo agente</CardTitle>
      <Input placeholder="Nome interno" />
      <Button fullWidth>Criar agente</Button>
    </Card>
  ),
};

function Input(props: React.ComponentProps<"input">) {
  return (
    <input
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-calead-accent"
      {...props}
    />
  );
}
