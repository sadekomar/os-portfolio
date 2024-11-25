import { Inbox, Download } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="mx-4 mb-10 flex flex-col items-start justify-center gap-4 md:mx-20">
        <h2 className="max-w-md text-4xl font-medium">
          {`I’m a Full-Stack Software Engineer, UI/UX Designer, and Founder.`}
        </h2>
        <p className="max-w-md text-2xl font-medium">
          {`I build web apps that aren’t just delightful and intuitive, but also also technically
          robust.`}
        </p>
        <div className="flex gap-2">
          <a
            className="gap flex h-10 items-center gap-2 rounded-3xl border-2 border-solid border-gray-700 px-4 font-medium transition-colors hover:bg-gray-700 hover:text-white"
            href="./resume.pdf"
            download={"resume-omar-sadek.pdf"}
          >
            <Download height={16} width={16} />
            Resume
          </a>
          <a
            href="mailto:sadekm.omar@gmail.com"
            className="flex h-10 w-fit items-center gap-2 rounded-3xl bg-[#E4E4E4] px-4 transition-colors hover:bg-gray-300"
          >
            <Inbox height={16} width={16} />
            Contact
          </a>
        </div>
      </div>

      <Work />
    </>
  );
}
function Work() {
  return (
    <>
      <h2 className="mx-4 mb-4 text-2xl font-medium underline-offset-4 group-hover:underline">
        Work
      </h2>
      <div className="mx-4 mb-10 grid gap-4 md:grid-cols-3">
        <Link
          href={"/work/loom-cairo"}
          className="group flex flex-col items-start gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-950"
        >
          <img src="./loom-thumbnail.png" alt="" />
          <div>
            <h3 className="text-xl font-medium underline-offset-4 group-hover:underline">
              Loom Cairo
            </h3>
            <p className="font-medium tracking-[-0.02em]">
              A fashion search engine that aggregates more than 300 local brands.
            </p>
          </div>
        </Link>
        <Link
          href={"/work/activity-management-platform"}
          className="group flex flex-col items-start gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-950"
        >
          <img src="./un-thumbnail.png" alt="" />
          <div>
            <h3 className="text-xl font-medium underline-offset-4 group-hover:underline">
              UN Activity Management Platform
            </h3>
            <p className="font-medium tracking-[-0.02em]">
              A platform to streamline event tracking for a UN agency.
            </p>
          </div>
        </Link>
        <Link
          href={"/work/little-lads"}
          className="group flex flex-col items-start gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-950"
        >
          <img src="./lads-thumbnail.png" alt="" />
          <div>
            <h3 className="text-xl font-medium underline-offset-4 group-hover:underline">
              Little Lads
            </h3>
            <p className="font-medium tracking-[-0.02em]">
              A fashion search engine that aggregates more than 300 local brands.
            </p>
          </div>
        </Link>
      </div>
    </>
  );
}
