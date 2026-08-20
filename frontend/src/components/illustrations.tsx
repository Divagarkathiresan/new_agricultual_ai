import React from "react";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { palette } from "@/theme/agriculture";

type Props = {
  name:
    | "welcome-farm"
    | "crop-recommendation"
    | "smart-advisory"
    | "market-prices"
    | "login-farm"
    | "otp-landscape"
    | "irrigation"
    | "soil-health"
    | "satellite-ndvi"
    | "crop-lifecycle"
    | "farmer"
    | "empty-farm";
  width?: number | string;
  height?: number;
};

export function Illustration({ name, width = "100%", height = 220 }: Props) {
  switch (name) {
    case "crop-recommendation":
      return <CropRecommendation width={width} height={height} />;
    case "smart-advisory":
      return <SmartAdvisory width={width} height={height} />;
    case "market-prices":
      return <MarketPrices width={width} height={height} />;
    case "soil-health":
      return <SoilHealth width={width} height={height} />;
    case "satellite-ndvi":
      return <SatelliteNdvi width={width} height={height} />;
    case "crop-lifecycle":
      return <CropLifecycle width={width} height={height} />;
    case "farmer":
      return <Farmer width={width} height={height} />;
    case "empty-farm":
      return <EmptyFarm width={width} height={height} />;
    case "irrigation":
      return <Irrigation width={width} height={height} />;
    case "otp-landscape":
      return <FarmLandscape width={width} height={height} subtle />;
    case "login-farm":
      return <FarmLandscape width={width} height={height} soft />;
    default:
      return <FarmLandscape width={width} height={height} />;
  }
}

function FarmLandscape({ width, height, soft, subtle }: { width: number | string; height: number; soft?: boolean; subtle?: boolean }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 360 230">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={soft || subtle ? "#F8FEF7" : "#E7F8F2"} />
          <Stop offset="1" stopColor="#FFFFFF" />
        </LinearGradient>
      </Defs>
      <Rect width="360" height="230" rx="28" fill="url(#sky)" />
      <Circle cx="286" cy="48" r="24" fill="#FFE8A6" opacity={subtle ? 0.45 : 1} />
      <Path d="M0 119c40-39 71-34 109-2 32-38 69-42 112-1 44-33 91-31 139 4v110H0z" fill={subtle ? "#DFF0DE" : "#CDEDC9"} />
      <Path d="M0 142c57-37 114-32 170 2 61-34 124-34 190 1v85H0z" fill={subtle ? "#EAF7E8" : "#A9DFA9"} />
      <Path d="M0 169h360v61H0z" fill={subtle ? "#F3FAF1" : "#72BD63"} />
      {[0, 1, 2, 3, 4].map((row) => (
        <Path key={row} d={`M${-30 + row * 12} 224 C80 ${185 + row * 6}, 230 ${190 + row * 5}, 390 218`} stroke={row % 2 ? "#0F7F3E" : "#B8E7B5"} strokeWidth="9" fill="none" opacity={subtle ? 0.28 : 0.9} />
      ))}
      {!subtle ? (
        <G>
          <Rect x="52" y="117" width="50" height="36" rx="6" fill="#FFFFFF" />
          <Path d="M46 119l31-24 32 24z" fill={palette.primaryDark} />
          <Rect x="265" y="145" width="42" height="22" rx="6" fill={palette.primary} />
          <Circle cx="274" cy="171" r="9" fill="#2B3B2B" />
          <Circle cx="304" cy="171" r="9" fill="#2B3B2B" />
          <Rect x="302" y="132" width="18" height="22" rx="5" fill="#F2B233" />
        </G>
      ) : null}
    </Svg>
  );
}

function CropRecommendation({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 260 220">
      <Ellipse cx="130" cy="184" rx="80" ry="18" fill="#DDF1DA" />
      <Path d="M80 169c35 12 70 12 104 0 0 24-104 24-104 0z" fill={palette.soil} />
      <Path d="M130 166V87" stroke={palette.primaryDark} strokeWidth="10" strokeLinecap="round" />
      <Path d="M130 111c-46-4-60-36-60-36 43-9 62 17 60 36zM133 99c42-19 68 0 68 0-28 34-61 27-68 0zM129 139c-34 6-52-16-52-16 31-20 55-7 52 16z" fill={palette.primary} />
      <Path d="M128 170c-18 10-29 25-31 42M132 170c19 10 29 25 32 42M130 169v43" stroke="#6F3F25" strokeWidth="4" strokeLinecap="round" />
      {[55, 205, 188].map((cx, index) => (
        <G key={cx}>
          <Circle cx={cx} cy={56 + index * 28} r="22" fill={palette.lightGreen} />
          <Path d="M-7 0h14M0-7v14" stroke={palette.primary} strokeWidth="4" strokeLinecap="round" transform={`translate(${cx} ${56 + index * 28}) rotate(${index * 30})`} />
        </G>
      ))}
    </Svg>
  );
}

function SmartAdvisory({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220">
      <Rect width="280" height="220" rx="26" fill="#F8FEF7" />
      <Rect x="95" y="28" width="90" height="164" rx="24" fill="#13261A" />
      <Rect x="104" y="43" width="72" height="132" rx="16" fill="#FFFFFF" />
      <Rect x="116" y="58" width="48" height="18" rx="9" fill={palette.lightGreen} />
      <Rect x="116" y="88" width="48" height="10" rx="5" fill="#D7EFE0" />
      <Rect x="116" y="108" width="34" height="10" rx="5" fill="#D7EFE0" />
      <Path d="M130 156v-26M130 139c-20-2-26-17-26-17 19-6 28 6 26 17zM133 134c19-10 31-2 31-2-13 17-28 14-31 2z" fill={palette.primary} />
      <Circle cx="65" cy="72" r="18" fill={palette.lightGreen} />
      <Circle cx="216" cy="94" r="20" fill={palette.lightGreen} />
      <Rect x="188" y="47" width="56" height="25" rx="12" fill="#FFFFFF" stroke="#D9ECD6" />
      <Rect x="36" y="118" width="58" height="26" rx="13" fill="#FFFFFF" stroke="#D9ECD6" />
      <Path d="M47 183c0-30 18-43 18-43s18 13 18 43zM203 183c0-34 20-49 20-49s20 15 20 49z" fill="#A9DFA9" />
    </Svg>
  );
}

function MarketPrices({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 210">
      <Rect x="45" y="82" width="190" height="88" rx="16" fill="#FFFFFF" stroke="#DDEDDD" />
      <Path d="M58 48h164l20 44H38z" fill={palette.primary} />
      <Path d="M58 48h33l-8 44H38zM124 48h33l-5 44h-36zM190 48h32l20 44h-45z" fill="#D8F1D6" />
      <Rect x="73" y="113" width="44" height="39" rx="10" fill="#F6D37A" />
      <Circle cx="178" cy="129" r="17" fill={palette.gold} />
      <Circle cx="201" cy="143" r="17" fill="#F4C852" />
      <Circle cx="92" cy="104" r="10" fill="#E55353" />
      <Circle cx="111" cy="103" r="10" fill="#22A447" />
      <Path d="M170 124h18M170 132h14" stroke="#8C6714" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function Irrigation({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 260 180">
      <Rect width="260" height="180" rx="24" fill={palette.mint} />
      <Path d="M35 132h190v28H35z" fill={palette.soil} />
      <Path d="M50 132c40-34 58-34 93 0 27-27 50-28 77 0" stroke="#4FA4E8" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.65" />
      {[70, 110, 150, 190].map((x) => (
        <Path key={x} d={`M${x} 129V83M${x} 102c-22-2-31-17-31-17 23-7 33 6 31 17zM${x + 2} 96c23-10 36 0 36 0-17 18-31 15-36 0z`} fill={palette.primary} />
      ))}
      <Path d="M66 40c-14 20-14 30 0 34 14-4 14-14 0-34zM199 35c-13 18-13 28 0 32 13-4 13-14 0-32z" fill="#4FA4E8" />
    </Svg>
  );
}

function SoilHealth({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 260 200">
      <Rect width="260" height="200" rx="24" fill="#F8FEF7" />
      <Path d="M50 114h160v44c0 18-15 32-32 32H82c-18 0-32-14-32-32z" fill={palette.soil} />
      <Path d="M130 116V63" stroke={palette.primaryDark} strokeWidth="8" strokeLinecap="round" />
      <Path d="M129 83c-35-2-45-25-45-25 33-8 48 11 45 25zM133 78c34-16 54 0 54 0-22 25-47 20-54 0z" fill={palette.primary} />
      <Path d="M128 123c-17 17-26 35-27 55M132 123c18 16 28 34 31 55M130 123v57" stroke="#F0C594" strokeWidth="4" strokeLinecap="round" />
      {[72, 130, 188].map((cx) => <Circle key={cx} cx={cx} cy="96" r="14" fill={palette.lightGreen} stroke={palette.primary} />)}
      <Path d="M196 145c-10 14-10 21 0 24 10-3 10-10 0-24z" fill="#4FA4E8" />
    </Svg>
  );
}

function SatelliteNdvi({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 210">
      <Rect width="280" height="210" rx="26" fill="#EFF9FF" />
      <Circle cx="78" cy="135" r="47" fill="#68B7E8" />
      <Path d="M43 125c30-18 62-17 95 4-6 31-31 53-60 53-23 0-43-13-54-32z" fill={palette.primary} opacity="0.9" />
      <Rect x="178" y="35" width="48" height="30" rx="8" fill="#FFFFFF" stroke="#B8D9EE" />
      <Rect x="136" y="38" width="36" height="23" rx="4" fill="#A9DFA9" />
      <Rect x="232" y="38" width="36" height="23" rx="4" fill="#A9DFA9" />
      <Path d="M199 66l-48 79" stroke="#86D9FF" strokeWidth="18" opacity="0.35" strokeLinecap="round" />
      <Rect x="144" y="132" width="95" height="45" rx="14" fill="#FFFFFF" stroke="#DDEDDD" />
      <Path d="M155 162c18-22 36-17 51-32 11 9 19 19 25 32z" fill={palette.primary} />
    </Svg>
  );
}

function CropLifecycle({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 150">
      <Rect width="320" height="150" rx="22" fill={palette.mint} />
      <Path d="M44 112h232" stroke="#B6DFB7" strokeWidth="6" strokeLinecap="round" />
      {[44, 102, 160, 218, 276].map((cx, index) => (
        <G key={cx}>
          <Circle cx={cx} cy="112" r="12" fill={palette.primary} />
          <Path d={`M${cx} 105v${-12 - index * 7}`} stroke={palette.primaryDark} strokeWidth="4" strokeLinecap="round" />
          {index > 0 ? <Path d={`M${cx} ${92 - index * 7}c-${10 + index * 2}-1-${14 + index * 4}-${8 + index * 2}-${14 + index * 4}-${8 + index * 2} ${12 + index * 3} ${18 + index * 4} ${6 + index * 3} ${14 + index * 4} ${8 + index * 2}z`} fill={palette.primary} /> : null}
          {index > 2 ? <Circle cx={cx + 13} cy={76 - index * 6} r={5 + index} fill="#F2B233" /> : null}
        </G>
      ))}
    </Svg>
  );
}

function Farmer({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 160">
      <Circle cx="80" cy="80" r="78" fill={palette.lightGreen} />
      <Path d="M35 145c6-33 26-48 45-48s39 15 45 48z" fill="#FFFFFF" />
      <Circle cx="80" cy="72" r="31" fill="#9B6641" />
      <Path d="M42 54c10-30 68-31 76 0-22 9-51 9-76 0z" fill="#FFFFFF" />
      <Path d="M55 47c17-21 39-21 53 0" stroke="#E8E8E8" strokeWidth="12" strokeLinecap="round" />
      <Circle cx="69" cy="73" r="3" fill="#2B1D16" />
      <Circle cx="91" cy="73" r="3" fill="#2B1D16" />
      <Path d="M68 88c8 8 18 8 25 0" stroke="#5A3221" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function EmptyFarm({ width, height }: { width: number | string; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 180">
      <Rect width="240" height="180" rx="24" fill={palette.mint} />
      <Circle cx="185" cy="42" r="24" fill="#FFE8A6" />
      <Ellipse cx="120" cy="139" rx="62" ry="16" fill="#D9ECD6" />
      <Path d="M78 132c28 14 56 14 84 0 0 22-84 22-84 0z" fill={palette.soil} />
      <Path d="M120 132V82" stroke={palette.primaryDark} strokeWidth="7" strokeLinecap="round" />
      <Path d="M119 100c-32-2-42-23-42-23 32-8 46 10 42 23zM123 94c33-15 51 0 51 0-22 24-45 19-51 0z" fill={palette.primary} />
    </Svg>
  );
}
