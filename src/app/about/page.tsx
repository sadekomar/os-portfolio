import Image from "next/image";

import bigShort from "./(images)/big-short.jpg";
import brol from "./(images)/brol.jpeg";
import cadavreExquis from "./(images)/cadavre-exquis.jpeg";
import dune from "./(images)/dune.jpg";
import euphories from "./(images)/euphories.jpeg";
import foundation from "./(images)/foundation.jpg";
import prideAndPrejudice from "./(images)/pride-and-prejudice.jpg";
import sapiens from "./(images)/sapiens.jpg";
import steveJobs from "./(images)/steve-jobs.jpg";

export default function About() {
  return (
    <>
      <div className="md:mx-auto">
        <div className="mx-4 my-10 md:mx-auto">
          <h1 className="mb-4 text-3xl font-semibold">About Me</h1>
          <p className="mb-4 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
            I was born on the 20th of April, 2000 in Cairo, Egypt. When I was 9, I discovered
            YouTube and my journey with technology began. I never stopped liking technology since
            then.
          </p>
          <p className="mb-4 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
            In 2021, I started programming by taking CS50. I love working on stuff and figuring out
            how to do things it’s one of the most fulfilling things in life to me. In 2023, I
            graduated with a degree in Electronics Engineering.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mx-4 mb-2 text-2xl font-semibold md:mx-0">Books</h2>
          <div className="flex gap-4 overflow-auto px-4 md:mx-auto md:px-0">
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg border border-solid border-gray-500"
                src={sapiens}
                alt="Foundation Poster"
                height={200}
              />
              <h3 className="font-medium">Sapiens</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg border border-solid border-gray-500"
                src={prideAndPrejudice}
                alt="Dune Poster"
                height={200}
              />
              <h3 className="max-w-[100px] font-medium">Pride And Prejudice</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg border border-solid border-gray-500"
                src={steveJobs}
                alt="The Big Short Poster"
                height={200}
              />
              <h3 className="font-medium">Steve Jobs</h3>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="mx-4 mb-2 text-2xl font-semibold md:mx-0">Series & Films</h2>
          <div className="flex gap-4 overflow-auto px-4 md:mx-auto md:px-0">
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg border border-solid border-gray-500"
                src={foundation}
                alt="Foundation Poster"
                height={200}
              />
              <h3 className="font-medium">Foundation</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg border border-solid border-gray-500"
                src={dune}
                alt="Dune Poster"
                height={200}
              />
              <h3 className="font-medium">Dune</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[200px] rounded-lg border border-solid border-gray-500"
                src={bigShort}
                alt="The Big Short Poster"
                height={200}
              />
              <h3 className="font-medium">The Big Short</h3>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="mx-4 mb-2 text-2xl font-semibold md:mx-0">Music</h2>
          <div className="flex gap-4 overflow-auto px-4 md:mx-auto md:px-0">
            <div className="flex-shrink-0">
              <Image
                className="h-[150px] rounded-lg border border-solid border-gray-500"
                src={euphories}
                alt="Euphories"
                height={150}
                width={150}
              />
              <h3 className="font-medium">Euphories</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[150px] rounded-lg border border-solid border-gray-500"
                src={brol}
                alt="Dune Poster"
                height={150}
                width={150}
              />
              <h3 className="font-medium">Brol</h3>
            </div>
            <div className="flex-shrink-0">
              <Image
                className="h-[150px] rounded-lg border border-solid border-gray-500"
                src={cadavreExquis}
                alt="Cadavre exquis"
                height={150}
                width={150}
              />
              <h3 className="font-medium">Cadavre exquis</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
