import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "../src/tokens/colors";
import { typography } from "../src/tokens/typography";

const meta: Meta = {
  title: "Calead/Tokens",
  tags: ["autodocs"],
};

export default meta;

export const Colors: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Object.entries(colors.brand).map(([name, hex]) => (
        <div key={name} className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 h-12 rounded-md border" style={{ backgroundColor: hex }} />
          <p className="text-sm font-medium text-slate-900">brand.{name}</p>
          <p className="text-xs text-slate-500">{hex}</p>
        </div>
      ))}
    </div>
  ),
};

export const Typography: StoryObj = {
  render: () => (
    <div className="space-y-2" style={{ fontFamily: typography.fontFamily.sans }}>
      <p className="text-xl font-semibold">Page title — {typography.fontSize.xl}</p>
      <p className="text-sm text-slate-600">Body small — {typography.fontSize.sm}</p>
      <p className="text-xs text-slate-400">Caption — {typography.fontSize.xs}</p>
    </div>
  ),
};
