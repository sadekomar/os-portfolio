import { contacts } from "@/data/contact";
import { menuPages } from "@/data/menuPages";
import { Inbox } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <>
      <div className="bg-gray-100 px-4 py-14 md:px-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[3fr_1fr_1fr]">
          <div>
            <h3 className="font-bold">Omar Sadek</h3>
            <p className="mb-4 max-w-[54ch] font-medium leading-6 tracking-[-0.02em]">
              Full-Stack Software Engineer interested in design-led UX/UI, performant databases, and
              scalable application architectures. I thrive on combining technical expertise with
              creative design to create technically robust yet engaging products.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-bold">Navigate</h3>
            <div className="grid gap-1">
              {menuPages.map((page) => (
                <Link href={page.slug} className="font-medium hover:underline" key={page.slug}>
                  {page.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-bold">Contact</h3>
            <div className="grid gap-1">
              {contacts.map((contact, index) => (
                <a
                  href={contact.url}
                  className="flex items-center gap-2 font-medium hover:underline hover:underline-offset-2"
                  target="_blank"
                  key={index}
                  rel="noopener noreferrer"
                >
                  {contact.icon}
                  {contact.name}
                </a>
              ))}
              <a
                href="mailto:sadekm.omar@gmail.com"
                className="flex items-center gap-2 font-medium hover:underline hover:underline-offset-2"
              >
                <Inbox className="h-4 w-4" />
                Mail
              </a>
            </div>
          </div>
        </div>
        <div className="my-6 h-px w-full bg-gray-300"></div>
        <div className="text-sm">Copyright © 2024 Omar Sadek. All Rights Reserved.</div>
      </div>
    </>
  );
}
