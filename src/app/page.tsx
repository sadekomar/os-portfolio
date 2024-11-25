import Link from "next/link";
import Image from "next/image";
import { Inbox, Download, ArrowRight } from "lucide-react";

import unThumbnail from "../../public/un-thumbnail.png";
import ladsThumbnail from "../../public/lads-thumbnail.png";
import loomThumbnail from "../../public/loom-thumbnail.png";

export default function Home() {
  return (
    <>
      <div className="mx-4 my-16 flex flex-col items-start justify-center gap-4 md:mx-20">
        <h2 className="max-w-md text-4xl font-medium text-gray-500">
          I’m a<span className="font-bold text-gray-950"> Full-Stack Software Engineer</span>, UI/UX
          Designer, and Founder.
        </h2>
        <p className="max-w-md text-2xl font-medium text-gray-700">
          {`I build web apps that aren’t just delightful and intuitive, but also also technically
          robust.`}
        </p>
        <div className="flex gap-2">
          <a
            className="gap flex h-10 items-center gap-2 rounded-3xl border-2 border-solid border-gray-700 px-4 font-semibold transition-colors hover:bg-gray-700 hover:text-white"
            href="./resume.pdf"
            download={"resume-omar-sadek.pdf"}
          >
            <Download height={16} width={16} />
            Resume
          </a>
          <a
            href="mailto:sadekm.omar@gmail.com"
            className="flex h-10 w-fit items-center gap-2 rounded-3xl bg-[#E4E4E4] px-4 font-semibold transition-colors hover:bg-gray-300"
          >
            <Inbox height={16} width={16} />
            Contact
          </a>
        </div>
      </div>

      <Work />

      <div>
        <h2 className="mx-4 mb-4 text-3xl font-bold underline-offset-4 md:mx-20">Services</h2>

        <div className="mx-4 grid gap-4 md:mx-20 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-xl font-bold underline-offset-4">Full-stack Development</h3>
            <p className="mb-4 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
              Project file structure state management reusable components separation of concerns
              React
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold underline-offset-4">UI/UX Design</h3>
            <p className="mb-4 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
              I turn complex ideas into intuitive experiences.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 md:mx-20">
        <h2 className="mb-4 text-3xl font-bold underline-offset-4">About</h2>
        <p className="mb-4 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
          When I’m not working, I’m at the gym, trying out new coffeeshops, or playing the violin.
        </p>
        <Link
          href={"/about"}
          className="flex h-10 w-fit items-center gap-2 rounded-3xl bg-gray-200 px-4 font-semibold"
        >
          See About
          <ArrowRight height={15} width={15} />
        </Link>
      </div>
    </>
  );
}
function Work() {
  return (
    <>
      <h2 className="mx-4 mb-4 text-3xl font-bold underline-offset-4 md:mx-20">Work</h2>
      <div className="mx-4 mb-10 grid gap-4 md:mx-20 md:grid-cols-3">
        <Link
          href={"/work/loom-cairo"}
          className="group flex flex-col items-start gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-950"
        >
          <Image src={loomThumbnail} alt="Loom Cairo Preview" priority />
          <div>
            <h3 className="mb-2 text-xl font-bold underline-offset-4">Loom Cairo</h3>
            <p className="mr-4 font-medium tracking-[-0.02em]">
              Loom is a search engine for local fashion. It collects data from over 300 websites and
              aggregates them all into a single platform for ease of use. It makes local brands much
              more accessible for users.
            </p>
          </div>
          <div className="flex h-10 items-center justify-center gap-2 rounded-3xl bg-gray-200 px-4 text-base font-semibold text-black">
            View Details
            <ArrowRight height={15} width={15} />
          </div>
        </Link>
        <Link
          href={"/work/activity-management-platform"}
          className="group flex flex-col items-start gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-950"
        >
          <Image src={unThumbnail} alt="UN Activity Management Platform" />
          <div>
            <h3 className="mb-2 text-xl font-bold underline-offset-4">
              UN Activity Management Platform
            </h3>
            <p className="mr-4 font-medium tracking-[-0.02em]">
              A platform created to help a UN Agency manage and coordinate activities across
              different regions, varying scales, and various stakeholders.
            </p>
          </div>
          <div className="flex h-10 items-center justify-center gap-2 rounded-3xl bg-gray-200 px-4 text-base font-semibold text-black">
            View Details
            <ArrowRight height={15} width={15} />
          </div>
        </Link>
        <Link
          href={"/work/little-lads"}
          className="group flex flex-col items-start gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-950"
        >
          <Image src={ladsThumbnail} alt="Little Lads Preview" />
          <div>
            <h3 className="mb-2 text-xl font-bold underline-offset-4">Little Lads</h3>
            <p className="mr-4 font-medium tracking-[-0.02em]">
              Little Lads is a growing fashion brand focused on boys’ apparel. I was tasked with
              revitalizing their website to improve brand equity, increase engagement and boost
              conversions.
            </p>
          </div>
          <div className="flex h-10 items-center justify-center gap-2 rounded-3xl bg-gray-200 px-4 text-base font-semibold text-black">
            View Details
            <ArrowRight height={15} width={15} />
          </div>
        </Link>
      </div>
    </>
  );
}
