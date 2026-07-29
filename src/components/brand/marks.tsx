import { cn } from "@/lib/utils";

/* ── Brand marks ──────────────────────────────────────────────────────────
   Two assets, one instrument. The wordmark is the name set in Inter at 500,
   the same face and the same weight as the live `Omar Sadek` in the header,
   and the monogram is its initials at 600 with the tracking closed to -0.05em.
   Neither is a drawing.

   That is the decision, not a shortcut around one. A site whose whole argument
   is that it has a single voice does not get to grow a second one at the top
   left: a hand-lettered mark would be the only shape on the page with no
   relative anywhere else in the system, and it would read as a logo bolted on
   rather than as the site signing its own name. The monogram's weight step is
   the one deliberate departure, and it is the same counter-scaling move
   ICON_SIZES makes: at 16px in a menu row, 500 goes thin and grey against the
   label beside it, so the mark is drawn heavier to arrive at the same
   perceived weight.

   The geometry is outlined rather than set as live text, which is what makes
   these assets rather than markup. Copied into Figma or a deck they render as
   the real letterforms on a machine that has never had Inter installed, and
   they cannot be re-flowed by someone else's stylesheet.

   Regenerate with `scripts/build-brand-marks.py`, which cuts them out of the
   very woff2 next/font serves. Vendored here rather than built at runtime for
   the reason icon/glyphs.ts vendors its Hugeicons masters: this is four lines
   of geometry that change only when the brand does, and in-tree they stay
   diffable in review.

   Both viewBoxes are the ink's own bounding box, so they carry a negative
   origin and no padding. A mark trimmed to its ink can be aligned like any
   other object in a row; one padded out to the font's line box makes every
   call site compensate for space these particular letters never use. */

type Mark = {
  /** The ink's bounding box in font units. Negative origin; see above. */
  viewBox: string;
  d: string;
  /** width ÷ height, for call sites that need to reserve the slot. */
  aspect: number;
};

/** "OS", Inter 600, opsz 32, tracking -0.05em. */
export const LOGOMARK: Mark = {
  viewBox: "72 -1514 2595 1538",
  aspect: 1.687,
  d: "M765.9 24Q566.8 24 409.6 -71.4Q252.5 -166.8 162.2 -339.6Q72 -512.4 72 -744Q72 -977.6 162.2 -1150.6Q252.5 -1323.6 409.6 -1418.8Q566.8 -1514 765.9 -1514Q965.7 -1514 1122.4 -1418.8Q1279 -1323.6 1369.4 -1150.6Q1459.8 -977.6 1459.8 -744Q1459.8 -512 1369.4 -339.2Q1279 -166.4 1122.4 -71.2Q965.7 24 765.9 24ZM765.9 -213.1Q887.6 -213.1 984.4 -275.1Q1081.2 -337 1137.3 -455.7Q1193.4 -574.4 1193.4 -744Q1193.4 -914.6 1137.3 -1033.8Q1081.2 -1153 984.4 -1214.9Q887.6 -1276.9 765.9 -1276.9Q644.6 -1276.9 547.8 -1214.9Q451 -1153 394.7 -1033.8Q338.4 -914.6 338.4 -744Q338.4 -574.4 394.7 -455.7Q451 -337 547.8 -275.1Q644.6 -213.1 765.9 -213.1ZM2092.6 24Q1908.4 24 1776.3 -37Q1644.2 -97.9 1573.4 -212.2Q1502.6 -326.4 1502.6 -485.8H1761.8Q1762.9 -396.3 1802.7 -331.9Q1842.5 -267.4 1916.9 -233.2Q1991.3 -199 2094.4 -199Q2188 -199 2257.1 -225.5Q2326.3 -251.9 2365 -300.3Q2403.7 -348.6 2403.7 -413.9Q2403.7 -466.5 2375.8 -505.7Q2347.8 -544.8 2287.1 -574.1Q2226.4 -603.4 2127 -625.8L1966.9 -662.1Q1743.2 -712.7 1637.5 -812.8Q1531.8 -913 1531.8 -1070Q1531.8 -1203.7 1600.2 -1303.3Q1668.6 -1403 1792.1 -1458.5Q1915.7 -1514 2080 -1514Q2246.2 -1514 2367.7 -1456.6Q2489.2 -1399.2 2556.8 -1292.7Q2624.4 -1186.2 2628.8 -1038.5H2377.4Q2369.7 -1156.2 2289.8 -1223.2Q2209.8 -1290.3 2079.1 -1290.3Q1996.8 -1290.3 1932.9 -1263.9Q1869 -1237.5 1832.6 -1190.7Q1796.2 -1144 1796.2 -1083Q1796.2 -1032.9 1823.7 -996.4Q1851.2 -959.8 1910.9 -932.1Q1970.7 -904.3 2067.5 -882L2218.9 -847.2Q2334.7 -821.2 2419.2 -783.6Q2503.7 -746 2558.6 -694.9Q2613.4 -643.8 2640.1 -578Q2666.8 -512.1 2666.8 -430.2Q2666.8 -291.4 2596.8 -189.3Q2526.8 -87.2 2397.9 -31.6Q2269 24 2092.6 24Z",
};

/** "Omar Sadek", Inter 500, opsz 32, tracking -0.028em. */
export const LOGOTYPE: Mark = {
  viewBox: "81 -1514 10690 1538",
  aspect: 6.951,
  d: "M766.5 24Q568.4 24 413.3 -73.2Q258.2 -170.4 169.6 -343.5Q81 -516.7 81 -744Q81 -973.3 169.6 -1146.5Q258.2 -1319.8 413.3 -1416.9Q568.4 -1514 766.5 -1514Q965.4 -1514 1119.9 -1416.9Q1274.5 -1319.8 1363.2 -1146.5Q1451.9 -973.3 1451.9 -744Q1451.9 -516.5 1363.2 -343.4Q1274.5 -170.2 1119.9 -73.1Q965.4 24 766.5 24ZM766.5 -178.6Q894.8 -178.6 999.7 -244.3Q1104.6 -310 1166.7 -436.3Q1228.7 -562.7 1228.7 -744Q1228.7 -926.3 1166.7 -1053.2Q1104.6 -1180 999.7 -1245.7Q894.8 -1311.4 766.5 -1311.4Q638.3 -1311.4 533.4 -1245.7Q428.5 -1180 366.3 -1053.2Q304.2 -926.3 304.2 -744Q304.2 -562.7 366.3 -436.3Q428.5 -310 533.4 -244.3Q638.3 -178.6 766.5 -178.6ZM1594.5 0V-1056H1799.7V-832.8H1779.8Q1809.7 -913.4 1860.3 -967.6Q1910.9 -1021.8 1976.6 -1049.3Q2042.3 -1076.7 2115 -1076.7Q2238 -1076.7 2325.4 -1006.5Q2412.8 -936.3 2433 -832.8H2399.3Q2421.2 -903 2470.9 -958.1Q2520.7 -1013.1 2592.9 -1044.9Q2665.1 -1076.7 2753 -1076.7Q2851.4 -1076.7 2931.4 -1034Q3011.4 -991.3 3058.4 -906.5Q3105.5 -821.6 3105.5 -694.5V0H2894.1V-676.5Q2894.1 -790 2830.9 -840.8Q2767.8 -891.6 2681.8 -891.6Q2611.6 -891.6 2560.5 -861.9Q2509.5 -832.2 2481.7 -780.1Q2453.9 -728 2453.9 -660.1V0H2246.1V-691.3Q2246.1 -782.1 2187.4 -836.9Q2128.8 -891.6 2038.5 -891.6Q1977.2 -891.6 1924 -862.7Q1870.8 -833.9 1838.3 -777.2Q1805.9 -720.5 1805.9 -637.2V0ZM3608.5 16.5Q3503.3 16.5 3420.7 -19.1Q3338 -54.7 3290 -125.8Q3241.9 -196.8 3241.9 -301.8Q3241.9 -392.5 3276.6 -450.3Q3311.3 -508.1 3370.1 -541.9Q3428.9 -575.6 3504.1 -593.2Q3579.3 -610.9 3659.4 -620.2Q3759 -632.7 3816.7 -640.3Q3874.4 -648 3899 -664.3Q3923.6 -680.7 3923.6 -718.7V-727.6Q3923.6 -779.3 3898.3 -818.9Q3873.1 -858.4 3825.3 -881.1Q3777.5 -903.7 3710.1 -903.7Q3643.2 -903.7 3591.8 -881.6Q3540.3 -859.5 3510 -821.2Q3479.6 -782.9 3475.6 -733.9H3267.9Q3273.6 -835 3329.5 -912Q3385.4 -988.9 3483.4 -1032.8Q3581.3 -1076.7 3713 -1076.7Q3810.4 -1076.7 3888.3 -1051.8Q3966.2 -1026.9 4020.7 -980.5Q4075.2 -934.2 4103.9 -869.2Q4132.6 -804.2 4132.6 -724V0H3924.7V-149.6H3920.7Q3898.8 -107.1 3860.4 -69Q3821.9 -30.9 3760.7 -7.2Q3699.4 16.5 3608.5 16.5ZM3651.6 -152.9Q3744.6 -152.9 3805.2 -186.6Q3865.8 -220.4 3895 -275.3Q3924.3 -330.3 3924.3 -395.3V-518.7Q3913.4 -510.4 3888.7 -502.9Q3864 -495.5 3829 -488.5Q3794 -481.6 3753.4 -475Q3712.8 -468.5 3670.8 -462.6Q3613.4 -454.8 3563.4 -436.3Q3513.4 -417.8 3482.7 -384.9Q3451.9 -352 3451.9 -298Q3451.9 -252.9 3476.3 -220.3Q3500.8 -187.7 3545.6 -170.3Q3590.5 -152.9 3651.6 -152.9ZM4312.8 0V-1056H4515.4V-885.3H4519.1Q4548.1 -971.8 4610.7 -1020.5Q4673.4 -1069.1 4774.2 -1069.1Q4798.2 -1069.1 4818.5 -1067.5Q4838.7 -1065.8 4851.2 -1064.2V-867.2Q4839.2 -869.7 4808 -873.4Q4776.8 -877 4739.6 -877Q4680.9 -877 4631.6 -849.9Q4582.4 -822.7 4553.3 -766.7Q4524.2 -710.7 4524.2 -624.1V0ZM5913.8 24Q5735.7 24 5606.6 -37.2Q5477.6 -98.5 5407.7 -212.1Q5337.8 -325.7 5337.8 -482.9H5559.4Q5559.9 -385.2 5602.1 -314.7Q5644.2 -244.2 5723.9 -206.9Q5803.6 -169.5 5914.7 -169.5Q6016 -169.5 6090.8 -198.7Q6165.6 -227.9 6207.5 -281.6Q6249.3 -335.3 6249.3 -407.9Q6249.3 -465.3 6220.9 -507.8Q6192.4 -550.4 6129.8 -582.3Q6067.2 -614.2 5963.5 -638.4L5799.9 -677.1Q5574.1 -730.4 5470.7 -827.4Q5367.4 -924.5 5367.4 -1079Q5367.4 -1210.3 5433.3 -1307.9Q5499.3 -1405.5 5619 -1459.7Q5738.8 -1514 5898.5 -1514Q6059.1 -1514 6177.1 -1457.1Q6295.1 -1400.1 6360.9 -1294.8Q6426.7 -1189.6 6430.9 -1044.2H6216.2Q6208.3 -1173.1 6122.4 -1246.4Q6036.4 -1319.7 5895 -1319.7Q5805.9 -1319.7 5736.7 -1290.5Q5667.5 -1261.2 5628 -1209.4Q5588.6 -1157.5 5588.6 -1090Q5588.6 -1035.9 5617.3 -996.2Q5646.1 -956.4 5708.7 -926Q5771.3 -895.6 5873.7 -871L6033.9 -832.6Q6146.3 -806.1 6228.6 -768.3Q6310.8 -730.5 6364.5 -679.9Q6418.2 -629.4 6444.5 -564.7Q6470.9 -500.1 6470.9 -420.1Q6470.9 -286.2 6402.1 -186.1Q6333.4 -86.1 6208.2 -31Q6083 24 5913.8 24ZM6930.1 16.5Q6824.9 16.5 6742.3 -19.1Q6659.6 -54.7 6611.6 -125.8Q6563.5 -196.8 6563.5 -301.8Q6563.5 -392.5 6598.2 -450.3Q6632.9 -508.1 6691.7 -541.9Q6750.5 -575.6 6825.7 -593.2Q6900.9 -610.9 6981 -620.2Q7080.6 -632.7 7138.3 -640.3Q7196 -648 7220.6 -664.3Q7245.2 -680.7 7245.2 -718.7V-727.6Q7245.2 -779.3 7220 -818.9Q7194.7 -858.4 7146.9 -881.1Q7099.1 -903.7 7031.7 -903.7Q6964.9 -903.7 6913.4 -881.6Q6861.9 -859.5 6831.6 -821.2Q6801.2 -782.9 6797.2 -733.9H6589.5Q6595.2 -835 6651.1 -912Q6707 -988.9 6805 -1032.8Q6903 -1076.7 7034.6 -1076.7Q7132 -1076.7 7209.9 -1051.8Q7287.9 -1026.9 7342.3 -980.5Q7396.8 -934.2 7425.5 -869.2Q7454.3 -804.2 7454.3 -724V0H7246.3V-149.6H7242.3Q7220.4 -107.1 7182 -69Q7143.5 -30.9 7082.3 -7.2Q7021.1 16.5 6930.1 16.5ZM6973.2 -152.9Q7066.2 -152.9 7126.8 -186.6Q7187.4 -220.4 7216.7 -275.3Q7245.9 -330.3 7245.9 -395.3V-518.7Q7235 -510.4 7210.3 -502.9Q7185.6 -495.5 7150.6 -488.5Q7115.7 -481.6 7075 -475Q7034.4 -468.5 6992.5 -462.6Q6935.1 -454.8 6885.1 -436.3Q6835.1 -417.8 6804.3 -384.9Q6773.5 -352 6773.5 -298Q6773.5 -252.9 6798 -220.3Q6822.4 -187.7 6867.3 -170.3Q6912.1 -152.9 6973.2 -152.9ZM8040.6 20.7Q7903.4 20.7 7800.1 -48.6Q7696.7 -117.9 7639.8 -241.6Q7582.9 -365.3 7582.9 -528.4Q7582.9 -691.2 7640.1 -814.8Q7697.3 -938.4 7800.5 -1007.5Q7903.7 -1076.7 8039.8 -1076.7Q8108.8 -1076.7 8169.8 -1057.6Q8230.8 -1038.4 8280.2 -1000.1Q8329.7 -961.7 8363.5 -903.2H8365.4V-1490H8576.8V0H8369.4V-160.7H8367.5Q8332.1 -99.5 8281.8 -59.2Q8231.5 -18.8 8170.6 0.9Q8109.7 20.7 8040.6 20.7ZM8083.3 -161.3Q8173.6 -161.3 8240.2 -206.7Q8306.8 -252.2 8343.1 -334.9Q8379.4 -417.6 8379.4 -528.4Q8379.4 -639.9 8343.1 -722.4Q8306.8 -804.9 8240.2 -850.4Q8173.6 -895.9 8083.3 -895.9Q7999 -895.9 7934.2 -853.7Q7869.5 -811.5 7833.1 -729.8Q7796.7 -648.1 7796.7 -528.4Q7796.7 -409.4 7833.1 -327.6Q7869.5 -245.7 7934.2 -203.5Q7999 -161.3 8083.3 -161.3ZM9208.3 24Q9051.7 24 8939.1 -46.9Q8826.4 -117.8 8766 -242.4Q8705.6 -367 8705.6 -526.4Q8705.6 -687.5 8768.4 -812.4Q8831.2 -937.4 8942.1 -1008.7Q9053.1 -1080 9197.1 -1080Q9309.2 -1080 9400 -1040.1Q9490.7 -1000.2 9555.7 -926.4Q9620.7 -852.7 9655.4 -751.7Q9690.2 -650.6 9690.2 -528.3V-470.5H8800.6V-630.6H9579.5L9486.6 -581.7Q9486.6 -680.4 9451.2 -752.7Q9415.9 -825 9351.4 -864.4Q9287 -903.9 9199 -903.9Q9112.1 -903.9 9048 -864.4Q8983.9 -825 8948.5 -752.7Q8913.2 -680.4 8913.2 -581.7V-490.8Q8913.2 -391 8948 -314.6Q8982.8 -238.1 9049.5 -195.2Q9116.1 -152.3 9211.2 -152.3Q9280.5 -152.3 9333.4 -173.6Q9386.4 -194.8 9421.4 -232.9Q9456.5 -271.1 9471.6 -321.2H9674.7Q9654.9 -219 9589.6 -141.3Q9524.2 -63.6 9425.9 -19.8Q9327.7 24 9208.3 24ZM10009.5 -354.8V-604.6H10028.5L10479.3 -1056H10741.1L10239 -545.6H10205.7ZM9814.7 0V-1490H10026.1V0ZM10512.3 0 10114.3 -498.6 10259.2 -645.7 10771.1 0Z",
};

/* Height-driven, never width-driven: both marks are set from a common cap
   height, so a monogram and a wordmark placed in the same row agree on their
   letter size rather than on their bounding boxes. `h-*` at the call site,
   width follows from the aspect. */
function MarkSVG({ mark, className, label }: { mark: Mark; className?: string; label?: string }) {
  return (
    <svg
      viewBox={mark.viewBox}
      fill="none"
      /* w-auto so `h-*` alone drives the size; shrink-0 for the same reason
         Icon.tsx sets it: these sit in flex rows beside text that wraps, and
         without it the mark is what gives. */
      className={cn("w-auto shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path fill="currentColor" d={mark.d} />
    </svg>
  );
}

export function Logomark(props: { className?: string; label?: string }) {
  return <MarkSVG mark={LOGOMARK} {...props} />;
}

export function Logotype(props: { className?: string; label?: string }) {
  return <MarkSVG mark={LOGOTYPE} {...props} />;
}

/* The copyable form. `xmlns` because the copied string leaves the browser's
   HTML parser behind and has to stand alone as a document; `currentColor`
   because a mark that hard-codes #191919 is wrong the moment it lands on
   anything but this background, and every sane destination (Figma, a deck,
   another stylesheet) will recolour it. No width or height: the aspect is in
   the viewBox, and a mark that ships a pixel size is a mark someone has to
   fight. */
function svgSource(mark: Mark) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="${mark.viewBox}">` +
    `<path fill="currentColor" d="${mark.d}"/>` +
    `</svg>`
  );
}

export const LOGOMARK_SVG = svgSource(LOGOMARK);
export const LOGOTYPE_SVG = svgSource(LOGOTYPE);
