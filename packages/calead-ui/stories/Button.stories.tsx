import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/components/Button";

const meta: Meta<typeof Button> = {
  title: "Calead/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "link"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Novo agente", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Copiar snippet", variant: "secondary" },
};

export const Ghost: Story = {
  args: { children: "Sair", variant: "ghost" },
};

export const Link: Story = {
  args: { children: "Prefere agendar reunião?", variant: "link" },
};

export const FullWidth: Story = {
  args: { children: "Entrar", variant: "primary", fullWidth: true },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
};
