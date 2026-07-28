{ error : "Unsupported Node.js version with Expo Metro config",
  reason : "Expo Router / Metro configuration uses Array.prototype.toReversed, which requires Node.js >= 20.19.4. Node.js v18 does not include this runtime method.",
  solution : "Upgrade Node.js to v20.19.4 or newer, then rerun `npx expo start`."
}
