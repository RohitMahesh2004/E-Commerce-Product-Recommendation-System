"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconShoppingCart,
  IconGift,
  IconChartBar,
  IconTrendingUp,
  IconBrandShopee,
  IconCurrencyDollar,
  IconHeart,
} from "@tabler/icons-react";

export function BentoGridDemo() {
  return (
    <BentoGrid className="max-w-6xl mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={i === 3 || i === 6 ? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
  );
}

const Skeleton = ({ img }: { img?: string }) => (
  <div
    className="flex flex-1 w-full h-full min-h-[8rem] rounded-xl bg-cover bg-center"
    style={{
      backgroundImage: img ? `url(${img})` : "linear-gradient(to bottom right, #ddd, #eee)",
    }}
  />
);

const items = [
  {
    title: "Nike Air Zoom Pegasus 40",
    description: "Because you love running and high-performance gear.",
    header: <Skeleton img="/products/shoe1.jpg" />,
    icon: <IconBrandShopee className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Apple Watch SE 2",
    description: "Recommended for your active lifestyle and health tracking needs.",
    header: <Skeleton img="/products/watch.jpg" />,
    icon: <IconChartBar className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Sony WH-1000XM5",
    description: "Perfect for your preference in immersive music and focus.",
    header: <Skeleton img="/products/headphones.jpg" />,
    icon: <IconHeart className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "MacBook Air M3",
    description: "You recently explored productivity tools and laptops.",
    header: <Skeleton img="/products/laptop.jpg" />,
    icon: <IconTrendingUp className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Lululemon Align Joggers",
    description: "Because you prefer premium comfort wear for daily use.",
    header: <Skeleton img="/products/joggers.jpg" />,
    icon: <IconGift className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "IKEA Standing Desk",
    description: "Boosts productivity for your home office setup.",
    header: <Skeleton img="/products/desk.jpg" />,
    icon: <IconCurrencyDollar className="h-4 w-4 text-neutral-500" />,
  },
];
