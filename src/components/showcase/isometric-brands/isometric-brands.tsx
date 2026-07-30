import {
  FoolsLogo,
  JuvenileLogo,
  KijaqoLogo,
  KongaLogo,
  LeonLogo,
  LockenLogo,
  OrgandyLogo,
  PpantherLogo,
  PsychLogo,
  QuwaLogo,
  RakinLogo,
} from "./brand-logos";

import "./isometric-brands.css";

/* An isometric field of brand marks, lifted from the Univyr marketplace home
   page. Seven lanes of parallelogram logos slide along a 30 degree diagonal,
   odd lanes down-right and even lanes up-left, so the field reads as a slow
   counter-rotating drift rather than a marquee.

   There is no JS animation loop and no ref. The whole thing is one 15s CSS
   `@keyframes` per direction plus a ladder of `--logo-offset` values, one
   rung per position in a lane. See isometric-brands.css for how that works.

   The lane and index classes are written out by hand rather than mapped over
   an array because the *sequence* of marks in each lane is authored, not
   generated: which logo lands next to which is a composition decision.

   No "use client" and no state, so this renders as a server component.

   The field is purely decorative, so the root carries aria-hidden. */

export function IsometricBrands() {
  return (
    <div className="isometric-brands" aria-hidden="true">
      <JuvenileLogo className={"first-logo first-logo-1"} />
      <LeonLogo className={"first-logo first-logo-2"} />
      <PsychLogo className={"first-logo first-logo-3"} />
      <PpantherLogo className={"first-logo first-logo-4"} />
      <JuvenileLogo className={"first-logo first-logo-5"} />
      <JuvenileLogo className={"first-logo first-logo-6"} />
      <LeonLogo className={"first-logo first-logo-7"} />
      <PsychLogo className={"first-logo first-logo-8"} />
      <PpantherLogo className={"first-logo first-logo-9"} />
      <JuvenileLogo className={"first-logo first-logo-10"} />

      <JuvenileLogo className={"second-logo second-logo-1"} />
      <LeonLogo className={"second-logo second-logo-2"} />
      <PsychLogo className={"second-logo second-logo-3"} />
      <PpantherLogo className={"second-logo second-logo-4"} />
      <JuvenileLogo className={"second-logo second-logo-5"} />
      <JuvenileLogo className={"second-logo second-logo-6"} />
      <LeonLogo className={"second-logo second-logo-7"} />
      <PsychLogo className={"second-logo second-logo-8"} />
      <PpantherLogo className={"second-logo second-logo-9"} />
      <JuvenileLogo className={"second-logo second-logo-10"} />
      <JuvenileLogo className={"second-logo second-logo-11"} />
      <LeonLogo className={"second-logo second-logo-12"} />
      <PsychLogo className={"second-logo second-logo-13"} />
      <PpantherLogo className={"second-logo second-logo-14"} />
      <JuvenileLogo className={"second-logo second-logo-15"} />
      <JuvenileLogo className={"second-logo second-logo-16"} />
      <LeonLogo className={"second-logo second-logo-17"} />
      <PsychLogo className={"second-logo second-logo-18"} />
      <PpantherLogo className={"second-logo second-logo-19"} />
      <JuvenileLogo className={"second-logo second-logo-20"} />

      <KongaLogo className={"third-logo third-logo-1"} />
      <OrgandyLogo className={"third-logo third-logo-2"} />
      <FoolsLogo className={"third-logo third-logo-3"} />
      <RakinLogo className={"third-logo third-logo-4"} />
      <PpantherLogo className={"third-logo third-logo-5"} />
      <KongaLogo className={"third-logo third-logo-6"} />
      <OrgandyLogo className={"third-logo third-logo-7"} />
      <FoolsLogo className={"third-logo third-logo-8"} />
      <RakinLogo className={"third-logo third-logo-9"} />
      <PpantherLogo className={"third-logo third-logo-10"} />
      <KongaLogo className={"third-logo third-logo-11"} />
      <OrgandyLogo className={"third-logo third-logo-12"} />
      <FoolsLogo className={"third-logo third-logo-13"} />
      <RakinLogo className={"third-logo third-logo-14"} />
      <PpantherLogo className={"third-logo third-logo-15"} />
      <KongaLogo className={"third-logo third-logo-16"} />
      <OrgandyLogo className={"third-logo third-logo-17"} />
      <FoolsLogo className={"third-logo third-logo-18"} />
      <RakinLogo className={"third-logo third-logo-19"} />
      <PpantherLogo className={"third-logo third-logo-20"} />

      <KijaqoLogo className={"fourth-logo fourth-logo-1"} />
      <LockenLogo className={"fourth-logo fourth-logo-2"} />
      <QuwaLogo className={"fourth-logo fourth-logo-3"} />
      <PpantherLogo className={"fourth-logo fourth-logo-4"} />
      <PpantherLogo className={"fourth-logo fourth-logo-5"} />
      <KijaqoLogo className={"fourth-logo fourth-logo-6"} />
      <LockenLogo className={"fourth-logo fourth-logo-7"} />
      <QuwaLogo className={"fourth-logo fourth-logo-8"} />
      <PpantherLogo className={"fourth-logo fourth-logo-9"} />
      <PpantherLogo className={"fourth-logo fourth-logo-10"} />
      <KijaqoLogo className={"fourth-logo fourth-logo-11"} />
      <LockenLogo className={"fourth-logo fourth-logo-12"} />
      <QuwaLogo className={"fourth-logo fourth-logo-13"} />
      <PpantherLogo className={"fourth-logo fourth-logo-14"} />
      <PpantherLogo className={"fourth-logo fourth-logo-15"} />
      <KijaqoLogo className={"fourth-logo fourth-logo-16"} />
      <LockenLogo className={"fourth-logo fourth-logo-17"} />
      <QuwaLogo className={"fourth-logo fourth-logo-18"} />
      <PpantherLogo className={"fourth-logo fourth-logo-19"} />
      <PpantherLogo className={"fourth-logo fourth-logo-20"} />

      <KijaqoLogo className={"fifth-logo fifth-logo-1"} />
      <LockenLogo className={"fifth-logo fifth-logo-2"} />
      <QuwaLogo className={"fifth-logo fifth-logo-3"} />
      <PpantherLogo className={"fifth-logo fifth-logo-4"} />
      <PpantherLogo className={"fifth-logo fifth-logo-5"} />
      <KijaqoLogo className={"fifth-logo fifth-logo-6"} />
      <LockenLogo className={"fifth-logo fifth-logo-7"} />
      <QuwaLogo className={"fifth-logo fifth-logo-8"} />
      <PpantherLogo className={"fifth-logo fifth-logo-9"} />
      <PpantherLogo className={"fifth-logo fifth-logo-10"} />
      <KijaqoLogo className={"fifth-logo fifth-logo-11"} />
      <LockenLogo className={"fifth-logo fifth-logo-12"} />
      <QuwaLogo className={"fifth-logo fifth-logo-13"} />
      <PpantherLogo className={"fifth-logo fifth-logo-14"} />
      <PpantherLogo className={"fifth-logo fifth-logo-15"} />
      <KijaqoLogo className={"fifth-logo fifth-logo-16"} />
      <LockenLogo className={"fifth-logo fifth-logo-17"} />
      <QuwaLogo className={"fifth-logo fifth-logo-18"} />
      <PpantherLogo className={"fifth-logo fifth-logo-19"} />
      <PpantherLogo className={"fifth-logo fifth-logo-20"} />

      <KijaqoLogo className={"sixth-logo sixth-logo-1"} />
      <LockenLogo className={"sixth-logo sixth-logo-2"} />
      <QuwaLogo className={"sixth-logo sixth-logo-3"} />
      <PpantherLogo className={"sixth-logo sixth-logo-4"} />
      <PpantherLogo className={"sixth-logo sixth-logo-5"} />
      <KijaqoLogo className={"sixth-logo sixth-logo-6"} />
      <LockenLogo className={"sixth-logo sixth-logo-7"} />
      <QuwaLogo className={"sixth-logo sixth-logo-8"} />
      <PpantherLogo className={"sixth-logo sixth-logo-9"} />
      <PpantherLogo className={"sixth-logo sixth-logo-10"} />
      <KijaqoLogo className={"sixth-logo sixth-logo-11"} />
      <LockenLogo className={"sixth-logo sixth-logo-12"} />
      <QuwaLogo className={"sixth-logo sixth-logo-13"} />
      <PpantherLogo className={"sixth-logo sixth-logo-14"} />
      <PpantherLogo className={"sixth-logo sixth-logo-15"} />
      <KijaqoLogo className={"sixth-logo sixth-logo-16"} />
      <LockenLogo className={"sixth-logo sixth-logo-17"} />
      <QuwaLogo className={"sixth-logo sixth-logo-18"} />
      <PpantherLogo className={"sixth-logo sixth-logo-19"} />
      <PpantherLogo className={"sixth-logo sixth-logo-20"} />

      <KijaqoLogo className={"seventh-logo seventh-logo-1"} />
      <LockenLogo className={"seventh-logo seventh-logo-2"} />
      <QuwaLogo className={"seventh-logo seventh-logo-3"} />
      <PpantherLogo className={"seventh-logo seventh-logo-4"} />
      <PpantherLogo className={"seventh-logo seventh-logo-5"} />
      <KijaqoLogo className={"seventh-logo seventh-logo-6"} />
      <LockenLogo className={"seventh-logo seventh-logo-7"} />
      <QuwaLogo className={"seventh-logo seventh-logo-8"} />
      <PpantherLogo className={"seventh-logo seventh-logo-9"} />
      <PpantherLogo className={"seventh-logo seventh-logo-10"} />
    </div>
  );
}
