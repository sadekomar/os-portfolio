"use client";

import { menuPages } from "@/data/menuPages";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Fragment, useState } from "react";

import { Menu, X } from "lucide-react";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b-[1px] border-solid border-gray-200 px-4 py-2 font-medium text-gray-600 md:px-20">
      <Link
        href={"/"}
        className="rounded-xl px-4 py-2 font-bold transition-colors hover:bg-gray-100"
      >
        Omar Sadek
      </Link>
      <div className="hidden md:flex">
        {menuPages.map((page) => (
          <Link
            key={page.slug}
            href={page.slug}
            className={`rounded-xl px-4 py-2 transition-colors ${
              pathname === page.slug ? "bg-gray-300" : "hover:bg-gray-100"
            }`}
          >
            {page.name}
          </Link>
        ))}
      </div>
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 p-0">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <SheetTitle className="sr-only">Hamburger Menu</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" className="absolute right-0 top-0 mx-4 my-2 h-10 w-10 p-0">
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </SheetClose>
            <nav className="mt-8 flex flex-col">
              {menuPages.map((page, index) => (
                <Fragment key={index}>
                  <Link
                    key={index}
                    href={page.slug}
                    className="block px-2 py-4 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {page.name}
                  </Link>
                  <Separator />
                </Fragment>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
