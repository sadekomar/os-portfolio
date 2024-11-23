export default function WorkDetails({ params }: { params: { work: string } }) {
  const loom = {
    title: "Loom Cairo",
    link: "loomcairo.com",
    description:
      "Loom is a search engine for local fashion. It collects data from over 300 websites and aggregates them all into a single platform for ease of use. It makes local brands much more accessible for users.",
    technologies: {
      backend: ["SQLite", "Python", "Selenium", "BeautifulSoup", "Flask"],
      frontend: [
        "Figma",
        "React",
        "JavaScript",
        "HTML/CSS",
        "Radix-ui",
        "Next.js",
        "framer-motion",
      ],
    },
    image: "/loom/loom-preview.png",
    imageAlt: "Loom Preview",
    paragraphs: [
      {
        title: "The Problem",
        content: [
          "The Egyptian Local fashion scene has seen a meteoric rise in recent years. However,  users face the cumbersome process of browsing multiple brand websites just to find a single item like a shirt or crewneck. There is currently no unified platform that offers a seamless shopping experience for discovering new fashion pieces, leaving a significant gap in this expanding market.",
        ],
        image: undefined,
      },
      {
        title: "Web Scraping",
        content: [
          "There is a huge variety of brand websites out there: shopify, sllr, elementor, zammit... etc. ",
          "I created a web scraper that works with all those different types of websites regardless of their differences. I used bs4 and selenium to do this. This scraper needs to handle a variety of scenarios such as websites that are entirely javascript rendered and others that are server-rendered and return HTML with a simple get request.",
          "To manage this complexity, I fell back to the principles of OOP. I broke down the problem to its simplest parts. I created a class that’s only responsible for an item’s data given its link and a brand’s dictionary (object). This class had to do exception handling to handle the various things that could go wrong and log them. The second part of the problem is discovering the items that exist for each website and interacting with the database.",
          "This taught me a lot about exception handling, abstract methods, class methods, custom exceptions, context manager.",
          "I also read Clean Code during this period which was immensely helpful. I picked a few things such as function cohesion, coupling, abstraction levels, private methods, and the value of unit tests... etc.",
        ],
        image: undefined,
      },
      {
        title: "Labelling Algorithm & Data Analysis",
        content: [
          "To enable the filters and improved search, I created an algorithm that labels the items. The loom database is quite large with about 17,000 items and 65,000 unique colors/sizes. I started out with cleaning and preprocessing the data such as fixing spelling inconsistencies, such as blue and bluee.  Then, I did data normalization by grouping together synonyms of colors such sky and blue into a single parent color.",
          "Based on the uncovered synonyms, inconsistencies, and data gathered from the original websites, I created a labeler that works really well on new items from new brands. It enables very rich filters and search all automatically.",
          "Try to go on other platforms and search for White Shirt and see which one has the most relevant results!!",
        ],
        image: undefined,
      },
      {
        title: "Database Schema Design and Optimization",
        content: [
          "I used SQLite to create my database. It started with the database schema. I created a database that was performant and scalable. To achieve this, I ensured that my database was normalized by using lookup tables for values that are repeated such as brands (this way i could have a single source of truth) and relating the various things using many-to-many relationships.",
          "I also used constraints to ensure data integrity at the database level. I also implemented triggers to ensure data is synced across related tables. Indices were used to speed up the performance of certain queries by orders of magnitude. A de-normalized view was created to simplify interaction with the database in the API.",
        ],
        image: "/loom/loom-db.png",
      },
      {
        title: "API",
        content: [
          "I created the API with flask. There are various endpoints. The search endpoint parses out words to detect if filters exist for those words otherwise it does a Full-Text Search. Other endpoints fetch metadata that’s needed for filters. The SQL queries are quite optimized as I have deep knowledge of the database schema, using the proper indices (based on B Trees).",
          "The explain query plan and timer come in really handy for optimization in those scenarios. I was able to get most queries down to sub 50ms response, especially the ones that do a lot of heavy lifting.",
        ],
        image: "/loom/loom-api.png",
      },
      {
        title: "UX/UI Design with Figma",
        content: [
          "Because the majority of users will be on mobile, and it’s easier to add complexity rather than it is to simplify a complex thing. A mobile-first approach was the apparent way to go for design.",
          "I researched the patterns that users are used to. I picked the brand colors, typography, a typescale and created the main layouts. I also created a design system to ensure consistency of design throughout the app using figma components. The designs respected the rules of hierarchy, consistency, white space, contrast, alignment, and balance.",
        ],
        image: "/loom/loom-brands.png",
      },
      {
        title: "React Web App",
        content: [
          "For the web app, I used React, vite, react-router, radix-ui, and vanilla CSS. I made use of CSS resets. global variables to ensure consistency of styles, and a typescale system. The website displays the items in a really unique way and has a bunch of cool stuff. Reusable components and pages of course, and a bunch of steps to ensure optimal performance. There’s search with autofill. History, likes, followed brands and a cart they can all keep track without the user having to login.",
          "This web app received praise from numerous users.",
        ],
        image: "/loom/loom-web-app.png",
      },
      {
        title: "Books I read that were relevant to this project",
        content: [
          "Clean Code by Robert C Martin came in especially handy for structuring code and laying out everything when it came to OOP.",
          "Thoughts on Design by Paul Rand talks about well-renowned designer Paul Rand’s approach to design and how he tackles everything.",
        ],
        image: "/loom/loom-books.png",
      },
    ],
  };

  return (
    <>
      <div className="mx-4 mt-10 md:mx-20">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">{loom.title}</h1>
        <a
          className="font-medium tracking-[-0.04em] text-[#525252] hover:underline"
          href={`https://${loom.link}`}
          target="_blank"
        >
          {loom.link}
        </a>
        <p className="mb-10 max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
          {loom.description}
        </p>

        <h2 className="mb-2 text-2xl font-bold tracking-tight">Technologies Used</h2>
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {loom.technologies.backend.length == 0 ? null : (
            <div>
              <h3 className="mb-1 font-medium">Backend</h3>
              <div className="flex flex-wrap gap-2">
                {loom.technologies.backend.map((tech) => (
                  <div
                    key={tech}
                    className="flex h-10 items-center rounded-xl bg-[#E4E4E4] px-3 font-medium"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}
          {loom.technologies.frontend.length == 0 ? null : (
            <div>
              <h3 className="mb-1 font-medium">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                {loom.technologies.frontend.map((tech) => (
                  <div
                    key={tech}
                    className="flex h-10 items-center rounded-xl bg-[#E4E4E4] px-3 font-medium"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <img src={loom.image} alt={loom.imageAlt} className="mb-10" />

      {loom.paragraphs.map((paragraph, index) => (
        <div key={index} className="mb-8">
          <div className="mx-4 mb-4 grid md:mx-20 md:grid-cols-[1fr_2fr]">
            <h3 className="mb-2 h-fit text-2xl font-semibold tracking-tight md:sticky md:top-2 md:max-w-60">
              {paragraph.title}
            </h3>
            <div className="max-w-[600px] font-medium leading-6 tracking-[-0.02em]">
              {paragraph.content.map((content) => (
                <p className="mb-4" key={content}>
                  {content}
                </p>
              ))}
            </div>
          </div>
          <img src={paragraph.image} alt="" />
        </div>
      ))}
    </>
  );
}
