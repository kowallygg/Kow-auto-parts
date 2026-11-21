
import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polyline,
  Ellipse,
} from 'react-native-svg';

const ICONS = {
  bara_fata: (
    <>
      <Path d="M8 16 L13 9 H35 L40 16 L38 29 H10 Z" />
      <Path d="M13 21 H35 M16 27 H32" />
      <Circle cx="12" cy="25" r="2" />
      <Circle cx="36" cy="25" r="2" />
    </>
  ),

  bara_spate: (
    <>
      <Path d="M8 13 L13 8 H35 L40 13 L38 28 H10 Z" />
      <Path d="M13 18 H35 M16 25 H32" />
      <Rect x="17" y="25" width="14" height="3" rx="1" />
    </>
  ),

  fata_completa: (
    <>
      <Path d="M5 30 L9 13 L16 7 H32 L39 13 L43 30 Z" />
      <Path d="M13 15 H35 L39 26 H9 Z" />
      <Path d="M16 19 H32 M20 23 H28" />
      <Circle cx="12" cy="16" r="3" />
      <Circle cx="36" cy="16" r="3" />
    </>
  ),

  aripa_fata: (
    <>
      <Path d="M7 32 Q8 14 21 10 H40 Q34 17 36 32 Z" />
      <Path d="M11 29 Q16 17 28 17 Q34 17 35 29" />
    </>
  ),

  aripa_spate: (
    <>
      <Path d="M7 31 Q10 12 25 10 H41 L37 31 Z" />
      <Path d="M11 29 Q17 17 29 17 Q34 17 36 29" />
    </>
  ),

  capota: (
    <>
      <Path d="M7 31 L11 14 Q12 10 17 10 H31 Q36 10 37 14 L41 31 Z" />
      <Path d="M14 27 L17 15 H31 L34 27" />
    </>
  ),

  portbagaj: (
    <>
      <Path d="M8 31 L11 13 Q12 9 17 9 H31 Q36 9 37 13 L40 31 Z" />
      <Path d="M12 25 H36 M16 13 H32" />
    </>
  ),

  usa: (
    <>
      <Rect x="12" y="5" width="24" height="38" rx="3" />
      <Path d="M15 9 H33 V25 H15 Z" />
      <Path d="M28 30 H33" />
      <Circle cx="29" cy="29" r="1" />
    </>
  ),

  prag: (
    <>
      <Path d="M7 22 H41 L38 31 H10 Z" />
      <Path d="M12 26 H36 M15 30 H33" />
    </>
  ),

  grila: (
    <>
      <Path d="M7 13 Q24 5 41 13 L38 34 H10 Z" />
      <Path d="M15 13 L13 31 M21 11 L20 32 M27 11 V32 M33 11 L35 31" />
      <Path d="M10 21 H38" />
    </>
  ),

  carenaj: (
    <>
      <Path d="M8 36 Q8 9 24 8 Q40 9 40 36" />
      <Path d="M13 35 Q13 15 24 14 Q35 15 35 35" />
      <Circle cx="24" cy="28" r="7" />
    </>
  ),

  scuturi: (
    <>
      <Path d="M9 12 L24 6 L39 12 L36 31 L24 40 L12 31 Z" />
      <Path d="M16 16 H32 L30 29 H18 Z" />
      <Path d="M19 21 H29" />
    </>
  ),

  geamuri: (
    <>
      <Path d="M6 30 L12 12 Q13 9 17 9 H31 Q35 9 37 13 L42 30 Z" />
      <Path d="M13 13 H33 L38 27 H8 Z" />
      <Path d="M24 13 V27" />
    </>
  ),

  oglinzi: (
    <>
      <Path d="M12 19 L22 19 L26 24" />
      <Path d="M22 19 Q20 7 32 8 Q42 9 41 19 Q40 27 29 26 L22 24 Z" />
      <Path d="M29 12 Q37 11 37 18" />
    </>
  ),

  faruri: (
    <>
      <Path d="M8 15 Q24 5 40 15 L37 31 Q24 39 8 29 Z" />
      <Path d="M13 17 Q24 10 35 16 L33 28 Q24 33 13 27 Z" />
      <Path d="M18 18 L15 26 M24 16 V29 M30 18 L33 26" />
    </>
  ),

  stopuri: (
    <>
      <Path d="M10 8 H38 L41 35 H7 Z" />
      <Path d="M15 12 H33 L35 19 H13 Z" />
      <Path d="M13 23 H35 L36 31 H12 Z" />
    </>
  ),

  maner: (
    <>
      <Path d="M7 17 Q24 8 41 17 L39 29 Q24 36 9 29 Z" />
      <Path d="M14 21 Q24 16 34 21 L32 25 Q24 29 16 25 Z" />
    </>
  ),

  eleron: (
    <>
      <Path d="M6 17 Q24 10 42 17 L39 23 H9 Z" />
      <Path d="M13 23 L11 32 M35 23 L37 32" />
      <Path d="M9 32 H39" />
    </>
  ),

  ornament: (
    <>
      <Path d="M8 15 Q24 7 40 15 L37 29 Q24 36 11 29 Z" />
      <Path d="M15 20 Q24 15 33 20" />
      <Path d="M17 25 H31" />
    </>
  ),

  bandou: (
    <>
      <Path d="M6 17 Q24 9 42 17 L40 27 Q24 34 8 27 Z" />
      <Path d="M12 21 Q24 16 36 21" />
    </>
  ),
};

export default function CaroserieIcon({
  name,
  size = 42,
  color = '#65B9FF',
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name] || (
        <Circle cx="24" cy="24" r="15" />
      )}
    </Svg>
  );
}
