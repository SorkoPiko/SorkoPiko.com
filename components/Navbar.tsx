"use client";

import {
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	Link,
} from "@nextui-org/react";
import { Logo } from "@/components/Logo";
import { usePathname  } from "next/navigation";

const navItems = [
	{ label: "Home", href: "/", section: "home" },
	{ label: "About", href: "/about", section: "about" },
	{ label: "Projects", href: "/projects", section: "projects" },
	{ label: "Contact", href: "/contact", section: "contact" },
];

export const CustomNavbar = () => {
	const pathname = usePathname ();

	return (
		<Navbar className="h-24" isBordered>
			<NavbarBrand>
				<Logo size="100" />
				<p className="font-bold text-inherit text-2xl ml-4">SorkoPiko</p>
			</NavbarBrand>
			<NavbarContent className="hidden sm:flex gap-4" justify="center">
				{navItems.map((item) => {
					const isActive = pathname === item.href
					return (
					<NavbarItem
						isActive={isActive}
						key={item.section}
					>
						<Link
							color={
								isActive
									? undefined
									: "foreground"
							}
							aria-current={
								isActive
									? "page"
									: undefined
							}
							href={item.href}
						>
							{item.label}
						</Link>
					</NavbarItem>
				)})}
			</NavbarContent>
		</Navbar>
	);
};
