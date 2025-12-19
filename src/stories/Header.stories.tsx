import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Header } from "../components/Header";

const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    setShowForm: fn(),
    signOut: fn(),
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    setShowForm: fn(),
    signOut: fn(),
  },
};
