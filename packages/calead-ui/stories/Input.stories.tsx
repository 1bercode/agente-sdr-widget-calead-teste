import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../src/components/Input";

const meta: Meta<typeof Input> = {
  title: "Calead/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Senha" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
};

export const Pill: Story = {
  args: { placeholder: "Escreva sua mensagem...", shape: "pill" },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
};
