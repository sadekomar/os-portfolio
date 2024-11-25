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
      <h1>About Me</h1>
      <p>
        I was born on the 20th of April, 2000 in Cairo, Egypt. When I was 9, I discovered YouTube
        and my journey with technology began. I never stopped liking technology since then.
      </p>
      <p>
        In 2021, I started programming by taking CS50. I love working on stuff and figuring out how
        to do things it’s one of the most fulfilling things in life to me. In 2023, I graduated with
        a degree in Electronics Engineering.
      </p>

      <div>
        <h2 className="text-lg font-medium">Books</h2>
        <p>{`Books I've been enjoying lately.`}</p>
        <div className="flex gap-4 overflow-auto">
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
            <h3 className="font-medium">Pride And Prejudice</h3>
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

      <div>
        <h2 className="text-lg font-medium">Series & Films</h2>
        <div className="flex gap-4 overflow-auto">
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

      <div>
        <h2 className="text-lg font-medium">Music</h2>
        <div className="flex gap-4 overflow-auto">
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
    </>
  );
}
