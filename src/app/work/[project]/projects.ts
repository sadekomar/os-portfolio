export type ProjectKeys = "loom-cairo" | "little-lads" | "activity-management-platform";

import loomPreview from "./(loom)/loom-preview.png";
import loomAPI from "./(loom)/loom-api.png";
import loomWebApp from "./(loom)/loom-web-app.png";
import loomBooks from "./(loom)/loom-books.png";
import loomBrands from "./(loom)/loom-brands.png";
import loomDb from "./(loom)/loom-db.png";

import ladsBooks from "./(lads)/ll-books.png";
import ladsNavigation from "./(lads)/ll-navigation.png";
import ladsPreview from "./(lads)/ll-preview.png";
import ladsProblem from "./(lads)/ll-problem.png";
import ladsTestimonials from "./(lads)/ll-testimonials.png";

import unPreview from "./(un)/un-preview.png";
import unActions from "./(un)/un-actions.png";
import unBooks from "./(un)/un-books.png";
import unDoubleDiamond from "./(un)/un-double-diamond.png";
import unWebApp from "./(un)/un-web-app.png";

import { StaticImageData } from "next/image";

export const allProjects: Record<
  ProjectKeys,
  {
    title: string;
    link?: string;
    description: string;
    technologies: {
      backend: string[];
      frontend: string[];
    };
    image: StaticImageData;
    imageAlt: string;
    paragraphs: { title: string; content: string[]; image?: StaticImageData }[];
  }
> = {
  "loom-cairo": {
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
    image: loomPreview,
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
        image: loomDb,
      },
      {
        title: "API",
        content: [
          "I created the API with flask. There are various endpoints. The search endpoint parses out words to detect if filters exist for those words otherwise it does a Full-Text Search. Other endpoints fetch metadata that’s needed for filters. The SQL queries are quite optimized as I have deep knowledge of the database schema, using the proper indices (based on B Trees).",
          "The explain query plan and timer come in really handy for optimization in those scenarios. I was able to get most queries down to sub 50ms response, especially the ones that do a lot of heavy lifting.",
        ],
        image: loomAPI,
      },
      {
        title: "UX/UI Design with Figma",
        content: [
          "Because the majority of users will be on mobile, and it’s easier to add complexity rather than it is to simplify a complex thing. A mobile-first approach was the apparent way to go for design.",
          "I researched the patterns that users are used to. I picked the brand colors, typography, a typescale and created the main layouts. I also created a design system to ensure consistency of design throughout the app using figma components. The designs respected the rules of hierarchy, consistency, white space, contrast, alignment, and balance.",
        ],
        image: loomBrands,
      },
      {
        title: "React Web App",
        content: [
          "For the web app, I used React, vite, react-router, radix-ui, and vanilla CSS. I made use of CSS resets. global variables to ensure consistency of styles, and a typescale system. The website displays the items in a really unique way and has a bunch of cool stuff. Reusable components and pages of course, and a bunch of steps to ensure optimal performance. There’s search with autofill. History, likes, followed brands and a cart they can all keep track without the user having to login.",
          "This web app received praise from numerous users.",
        ],
        image: loomWebApp,
      },
      {
        title: "Books I read that were relevant to this project",
        content: [
          "Clean Code by Robert C Martin came in especially handy for structuring code and laying out everything when it came to OOP.",
          "Thoughts on Design by Paul Rand talks about well-renowned designer Paul Rand’s approach to design and how he tackles everything.",
        ],
        image: loomBooks,
      },
    ],
  },
  "little-lads": {
    title: "Little Lads",
    link: "littleladseg.com",
    description:
      "Little Lads is a growing fashion brand focused on boys’ apparel.  I created their landing page.",
    technologies: {
      backend: [],
      frontend: ["Figma", "HTML/CSS", "JavaScript", "Shopify Liquid"],
    },
    image: ladsPreview,
    imageAlt: "Little Lads Preview",
    paragraphs: [
      {
        title: "The Problem",
        content: [
          "LittleLads is a growing fashion brand focused on boys’ apparel. They were facing several issues with their website:",
          "Navigation was cluttered and not intuitive, causing users to struggle when browsing products.",
          "The site lacked interactivity, resulting in low engagement rates.",
          "Limited mobile optimization, negatively impacting the user experience on mobile devices.",
          "The product pages were lacking essential features like product videos and customer testimonials, which are key drivers for conversion",
          "I was tasked with revitalizing their Shopify website to improve brand equity, increase engagement and boost conversions.",
        ],
        image: ladsProblem,
      },
      {
        title: "Figma Design",
        content: [
          "I started by analyzing the old website and annotating any problems that popped out to me. Then, I proceeded to brainstorm the possibilities for the landing page. The goal was to take the user on a journey that will elicit a specific response in the user so that they take a desired action at the end.",
          "By social proof (testimonials, best sellers), building a narrative (behind the name), and showing the quality of the items the users will ultimately start to trust the brand.",
          "Also, navigation is very important and it was shown in various AB tests to increase traffic by a substantial amount. Thus, I designed a mega menu and created a rich footer with links to the various categories and items.",
        ],
        image: ladsNavigation,
      },
      {
        title: "Shopify Components",
        content: [
          "Since certain components were either locked behind expensive themes, not available in the exact styles I was going for, or not available at all, I created custom components. I created a customer reviews marquee, autoplaying video, mega menu, and hotspots component. Shopify Liquid uses plain HTML, CSS, and JavaScript and it has an object to expose certain variables so that the Shopify admin can interface with the component without having to change the source code, making it much more maintainable.",
        ],
        image: ladsTestimonials,
      },
      {
        title: "Books I read that were relevant to this project",
        content: [
          "Thinking With Type By Ellen Lupton was such an interesting read and it was really instrumental in changing the way I perceive typography and its immense importance, paying attention to concepts such as modulation, line height, weight, x-height, and so much more...",
        ],
        image: ladsBooks,
      },
    ],
  },
  "activity-management-platform": {
    title: "Activity Management Platform (UN Agency)",
    link: undefined,
    description:
      "A dashboard created to help a UN Agency manage and coordinate activities across different regions, varying scales, and various stakeholders.",
    technologies: {
      backend: [],
      frontend: ["Figma", "React", "TypeScript", "Tailwind", "HTML", "MUI"],
    },
    image: unPreview,
    imageAlt: "UN Preview",
    paragraphs: [
      {
        title: "The Problem",
        content: [
          "Traditional methods to keep track of activities involve fragmented tools, leading to inefficiencies in communication and decision-making.",
          "The client needed a centralized platform to streamline oversight of these activities, ensuring transparency and effective decision-making. This platform needed to be user-friendly and robust.",
        ],
        image: undefined,
      },
      {
        title: "Information Architecture",
        content: [
          "I conducted an in-depth analysis of the client’s requirements to understand how the information should be laid out.",

          "The goal was to transform complex data into an intuitive, user-friendly interface. The main aim to get a sense of what users will expect and layout the information in a structure that aligns with those expectations. For instance, how administrators would add certain things and improve them. The design should be as intuitive as possible.",
        ],
        image: unDoubleDiamond,
      },
      {
        title: "Figma Design",
        content: [
          "Then, I started out by designing a low-fidelity layout to establish the foundation for the upcoming designs. Throughout the process, there were multiple decision points where I had to choose between various layouts or structures, weighing in which option would be more intuitive, user-friendly, and streamlined.  For instance, I had to choose between a card layout and a table layout, taking into consideration the trade-offs between information density and visual separation.",

          "Good design is about iteration and constant improvement. I worked in Figma to test out various colors, logos and typefaces, striving to get an aesthetically pleasing yet efficient, functional look and feel.",
          "Ultimately, this translates into much better user satisfaction, conversion rates, and because we catch usability issues early on in the development cycle, development costs are reduced.",
        ],
        image: unActions,
      },
      {
        title: "React Web App",
        content: [
          "In this project, I utilized React/TS, Tailwind, MUI, and TanStack Query to build a React web app. The codebase was very well-structured, with a clear separation of concerns and a robust architecture centered around reusable components.",
          "From the app initialization – handling login tokens and route guards – to the services and custom hooks that maintain best practices, every aspect was designed with flexibility and maintainability. A really neat trick was the use of a single state variable in the AppContext to manage modals app-wide. This minimized memory usage by eliminating the need to store a state variable for each edit, view, or add modal.  The upshot is a much more performant and efficient app.",
          "Overall, this project was an eye-opening experience that deepened my understanding of advanced React patterns, state management, and optimizing component architecture.",
        ],
        image: unWebApp,
      },
      {
        title: "Result",
        content: [
          "On a final note, working in a collaborate Git environment is valuable, but it has its own set of challenges. It’s important to adhere to commit naming conventions, utilize feature branches to maintain organization. It’s important to maintain a clean commit history, ensuring a smoother dev process and less errors.",
          "This project was well received by the client and will be utilized to streamline their management process and inform better decision-making.",
        ],
        image: undefined,
      },
      {
        title: "Books I read that were relevant to this project",
        content: [
          "Change by Design By Tim Brown was an awesome read to learn more about design thinking and how the whole process works.",
        ],
        image: unBooks,
      },
    ],
  },
};
