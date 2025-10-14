"use client";

import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";

/* ----------------------------- TYPES ----------------------------- */

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

/* ----------------------------- MAIN NAVBAR ----------------------------- */

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  // Detect scroll position and toggle blur/opacity
  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 40); // becomes opaque after 40px scroll
  });

  return (
    <motion.div
      ref={ref}
      animate={{
        backgroundColor: visible
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(255, 255, 255, 0)",
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(16px)" : "blur(0px)",
        boxShadow: visible
          ? "0 4px 20px rgba(0, 0, 0, 0.1)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 w-full transition-all duration-700",
        "border-b border-transparent dark:border-neutral-800",
        "dark:bg-transparent",
        className
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

/* ----------------------------- DESKTOP NAV ----------------------------- */

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        opacity: visible ? 1 : 0.95,
        y: visible ? 2 : 0,
      }}
      transition={{ type: "spring", stiffness: 180, damping: 30 }}
      className={cn(
        "relative z-[60] mx-auto hidden max-w-7xl flex-row items-center justify-between px-6 py-4 lg:flex",
        "text-black dark:text-white",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

/* ----------------------------- NAV ITEMS ----------------------------- */

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "hidden flex-1 flex-row items-center justify-center space-x-6 text-sm font-medium text-neutral-600 dark:text-neutral-300 lg:flex",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          key={item.name}
          href={item.link}
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 transition-all duration-200 hover:text-neutral-900 dark:hover:text-white"
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 rounded-full bg-neutral-200/50 dark:bg-neutral-800/70"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
          <span className="relative z-10">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

/* ----------------------------- MOBILE NAV ----------------------------- */

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "blur(0px)",
      }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative z-50 mx-auto flex w-full flex-col items-center justify-between px-4 py-3 lg:hidden",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => (
  <div className={cn("flex w-full items-center justify-between", className)}>
    {children}
  </div>
);

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "absolute inset-x-0 top-14 z-50 flex flex-col items-start gap-4 rounded-xl bg-white/90 px-5 py-6 shadow-lg backdrop-blur-md dark:bg-neutral-950/90",
          className
        )}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) =>
  isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
  );

/* ----------------------------- LOGO ----------------------------- */

export const NavbarLogo = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 text-lg font-semibold text-black dark:text-white"
  >
    <img
      src="https://assets.aceternity.com/logo-dark.png"
      alt="logo"
      width={28}
      height={28}
      className="rounded-md"
    />
    <span className="tracking-tight">Startup</span>
  </a>
);

/* ----------------------------- BUTTON ----------------------------- */

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-full font-medium text-sm cursor-pointer transition-transform duration-300 active:scale-95";

  const variantStyles = {
    primary:
      "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
    secondary:
      "bg-transparent border border-neutral-400/40 text-black dark:text-white hover:bg-neutral-100/40 dark:hover:bg-neutral-800/40",
    dark: "bg-neutral-900 text-white hover:bg-neutral-700",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white hover:opacity-90",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
