import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Inbox, Download, ArrowRight, ExternalLink } from "lucide-react";

import unThumbnail from "../../public/un-thumbnail.png";
import ladsThumbnail from "../../public/lads-thumbnail.png";
import loomThumbnail from "../../public/loom-thumbnail.png";
import instatusIcon from "../../public/instatus.svg";
import dellIcon from "../../public/dell.svg";
import argonautIcon from "../../public/argonaut.svg";
import argotempIcon from "../../public/argotemp.svg";
import univyrIcon from "../../public/univyr.svg";

import me from "../../public/me.png";
import museum from "../../public/museum.png";
import skatePark from "../../public/skate.png";
import sushi from "../../public/sushi.png";

export default function Home() {
  return (
    <>
      <div className="mx-4 my-16 flex flex-col items-start justify-center gap-4 md:mx-20">
        <h2 className="max-w-md text-4xl font-medium text-gray-500">
          I’m a<span className="font-bold text-gray-950"> Full-Stack Software Engineer</span>, UX/UI
          Designer, and Founder.
        </h2>
        <p className="max-w-md text-xl font-medium text-gray-700">
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
            Download Resume
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

      <Experience />
      <CompaniesWorkedWith />
      <VideoSection />
      <Work />

      <TechStack />
      <div className="mx-4 mb-10 grid gap-10 md:mx-20 md:grid-cols-[3fr_1fr]">
        <div className="flex gap-3 md:flex">
          <div>
            <Image
              src={museum}
              alt="Museum"
              className="h-full grayscale filter transition-all duration-500 hover:filter-none"
            />
          </div>
          <div className="grid gap-3">
            <Image
              className="h-auto grayscale filter transition-all duration-500 hover:filter-none"
              src={me}
              alt="Omar Sadek"
            />
            <Image
              className="h-auto grayscale filter transition-all duration-500 hover:filter-none"
              src={sushi}
              alt="Sushi"
            />
          </div>
          <div>
            <Image
              src={skatePark}
              alt="Skate Park"
              className="h-full grayscale filter transition-all duration-500 hover:filter-none"
            />
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-3xl font-bold underline-offset-4">About</h2>
          <p className="mb-4 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
            When I’m not working, I’m at the gym 💪, trying out new coffeeshops ☕, or playing the
            violin 🎻.
          </p>
          <Link
            href={"/about"}
            className="flex h-10 w-fit items-center gap-2 rounded-3xl bg-gray-200 px-4 font-semibold"
          >
            See About
            <ArrowRight height={15} width={15} />
          </Link>
        </div>
      </div>
    </>
  );
}
function Experience() {
  return (
    <>
      <h2 className="mx-4 mb-4 text-3xl font-bold underline-offset-4 md:mx-20">Experience</h2>
      <div className="mb-14 flex flex-col items-center justify-center bg-[#F2F2F2] py-16">
        <div className="mx-4 grid gap-2">
          <a
            href="https://instatus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-10 rounded-3xl border border-gray-300 bg-white px-10 py-5 shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-[0.98] hover:border-gray-500"
          >
            <Image src={instatusIcon} alt="Instatus Icon" />
            <div className="grid gap-2">
              <h3 className="font-bold">Instatus</h3>
              <div>
                <div className="font-medium">Full-Stack Software Engineer</div>
                <div className="font-medium">Dec 2024 - Present</div>
              </div>
            </div>
          </a>
          <a
            href="https://dell.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-10 rounded-3xl border border-gray-300 bg-white px-10 py-5 shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-[0.98] hover:border-gray-500"
          >
            <Image src={dellIcon} alt="Dell Icon" />
            <div className="grid gap-2">
              <h3 className="font-bold">Dell Technologies</h3>
              <div>
                <div className="font-medium">SA Internship</div>
                <div className="font-medium">Aug 2022 - Sep 2022</div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
}

function CompaniesWorkedWith() {
  return (
    <>
      <h2 className="mx-4 mb-4 text-3xl font-bold underline-offset-4 md:mx-20">
        Companies I've Worked With
      </h2>
      <div className="mb-14 bg-[#F2F2F2] py-16">
        <div className="mx-4 grid grid-cols-2 gap-4 md:mx-auto md:max-w-4xl md:grid-cols-3 lg:grid-cols-5">
          <div className="flex items-center justify-center rounded-2xl bg-white p-8 shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-105">
            <Image src={instatusIcon} alt="Instatus" />
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-white p-8 shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-105">
            <Image src={dellIcon} alt="Dell" />
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-white p-8 shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-105">
            <Image src={argonautIcon} alt="Argonaut" />
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-white p-8 shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-105">
            <Image src={argotempIcon} alt="Argotemp" />
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-white p-8 shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:scale-105">
            <Image src={univyrIcon} alt="Univyr" />
          </div>
        </div>
      </div>
    </>
  );
}

function VideoSection() {
  return (
    <>
      <h2 className="mx-4 mb-4 text-3xl font-bold underline-offset-4 md:mx-20">Video</h2>
      <div className="mb-14 flex items-center justify-center bg-[#F2F2F2] py-16">
        <div className="mx-4 flex h-[400px] w-full max-w-4xl items-center justify-center rounded-2xl bg-white shadow-[81px_49px_38px_rgba(0,0,0,0.01),_46px_28px_32px_rgba(0,0,0,0.02),_20px_12px_24px_rgba(0,0,0,0.04),_5px_3px_13px_rgba(0,0,0,0.04)] md:h-[500px]">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-400">Video embed placeholder</p>
            <p className="mt-2 text-sm text-gray-300">YouTube video will be embedded here</p>
          </div>
        </div>
      </div>
    </>
  );
}

function TechStack() {
  return (
    <>
      <h2 className="mx-4 mb-4 text-3xl font-bold underline-offset-4 md:mx-20">Tech Stack</h2>
      <div className="mb-10 bg-[#F2F2F2] py-14">
        <div className="mx-4 grid max-w-[416px] grid-cols-2 gap-2 sm:mx-auto">
          <a
            href="https://www.python.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            Python
            <ExternalLink height={15} width={15} />
          </a>
          <a
            href="https://www.w3schools.com/sql/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            SQL
            <ExternalLink height={15} width={15} />
          </a>
          <a
            href="https://flask.palletsprojects.com/en/2.2.x/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            Flask
            <ExternalLink height={15} width={15} />
          </a>
          <a
            href="https://www.figma.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            Figma
            <ExternalLink height={15} width={15} />
          </a>
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            Next.js
            <ExternalLink height={15} width={15} />
          </a>
          <a
            href="https://www.typescriptlang.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            TypeScript
            <ExternalLink height={15} width={15} />
          </a>
          <a
            href="https://tailwindcss.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            TailwindCSS
            <ExternalLink height={15} width={15} />
          </a>
          <a
            href="https://ui.shadcn.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 flex h-[68px] items-center justify-between gap-10 rounded-[16px] bg-white p-4 font-semibold shadow-[113px_72px_53px_rgba(97,97,97,0.01),_63px_40px_45px_rgba(97,97,97,0.04),_28px_18px_33px_rgba(97,97,97,0.06),_7px_4px_18px_rgba(97,97,97,0.07)] transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300"
          >
            Shadcn UI
            <ExternalLink height={15} width={15} />
          </a>
        </div>
      </div>
    </>
  );
}

function Work() {
  return (
    <>
      <h2 className="mx-4 mb-4 text-3xl font-bold underline-offset-4 md:mx-20">Work</h2>
      <div className="mx-4 mb-10 grid gap-4 md:mx-20">
        <WorkProject
          href="/work/loom-cairo"
          imgSrc={loomThumbnail}
          imgAlt="Loom Cairo Preview"
          title="Loom Cairo"
          description="Loom is a search engine for local fashion. It collects data from over 300 websites and aggregates them all into a single platform for ease of use. It makes local brands much more accessible for users."
          priority={true}
        />
        <WorkProject
          href="/work/activity-management-platform"
          imgSrc={unThumbnail}
          imgAlt="UN Activity Management Platform"
          title="UN Activity Management Platform"
          description="A platform created to help a UN Agency manage and coordinate activities across different regions, varying scales, and various stakeholders."
        />
        <WorkProject
          href="/work/little-lads"
          imgSrc={ladsThumbnail}
          imgAlt="Little Lads Preview"
          title="Little Lads"
          description="Little Lads is a growing fashion brand focused on boys’ apparel. I was tasked with revitalizing their website to improve brand equity, increase engagement and boost conversions."
        />
      </div>
    </>
  );
}

function WorkProject({
  href,
  imgSrc,
  imgAlt,
  title,
  description,
  priority = false,
}: {
  href: string;
  imgSrc: StaticImageData;
  imgAlt: string;
  title: string;
  description: string;
  priority?: boolean;
}) {
  return (
    <div className="mb-10 grid items-center gap-2 md:grid-cols-2 md:gap-10">
      <Image src={imgSrc} alt={imgAlt} priority={priority} />
      <div className="mx-auto max-w-sm">
        <h3 className="mb-2 text-xl font-bold underline-offset-4">{title}</h3>
        <p className="mb-6 font-medium leading-6 tracking-[-0.02em]">{description}</p>
        <Link
          href={href}
          className="flex h-10 w-fit items-center justify-center gap-2 rounded-3xl bg-gray-200 px-4 text-base font-semibold text-black transition-all duration-300 hover:border-2 hover:border-solid hover:border-gray-300 hover:bg-gray-300"
        >
          <ArrowRight height={15} width={15} />
          View Case Study
        </Link>
      </div>
    </div>
  );
}
