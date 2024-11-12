import { contacts } from "@/app/(data)/contact";
import { menuPages } from "@/app/(data)/menuPages";
import Link from "next/link";
import { IoMdMail } from "react-icons/io";

export function Footer() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 rounded-t-2xl bg-gray-200 px-20 py-20 md:grid-cols-[3fr_1fr_1fr]">
        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Omar Sadek</h3>
          <p className="max-w-[60ch]">
            Full-Stack Software Engineer interested in design-led UX/UI, performant databases, and
            scalable application architectures. I thrive on combining technical expertise with
            creative design to create technically robust yet engaging products.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Navigate</h3>
          {menuPages.map((page) => (
            <Link href={page.slug} className="hover:underline" key={page.slug}>
              {page.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold">Contact</h3>
          {contacts.map((contact, index) => (
            <a
              href={contact.url}
              className="flex items-center gap-2 hover:underline"
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
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <IoMdMail /> sadekm.omar@gmail.com
          </a>
        </div>
      </div>
    </>
  );
}
