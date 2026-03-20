/**
 * PixelDrop — data.js
 * =====================================================
 * SINGLE SOURCE OF TRUTH for all content on the website.
 * To add new content, copy one object below and fill in the fields.
 * See README.md for a step-by-step guide.
 *
 * IMPORTANT:
 * - downloadUrl must be Base64-encoded. Use btoa("your_link") in browser console.
 * - id must be unique, lowercase, use hyphens (no spaces).
 * - dateAdded / lastUpdated format: "YYYY-MM-DD"
 * =====================================================
 */

const CONTENTS = [
  {
    id: "realism-ultra-pack",
    name: "Realism Ultra Pack",
    category: "texture",                       // "texture" | "addon"
    tags: ["Realistic", "HD", "PBR"],
    thumbnail: "images/realism-ultra-thumb.jpg",
    screenshot: "images/realism-ultra-ss.jpg",
    description: "Ultra realistic texture pack with 128x128 resolution. Brings stunning visuals with PBR (Physically Based Rendering) effects for more realistic lighting, shadows, and materials. Recommended for mid-range devices and above.",
    mcpeVersion: "1.20 - 1.21",
    fileSize: "45 MB",
    downloadTime: "~1 minute",
    installTime: "~3 minutes",
    downloadUrl: btoa("https://www.mediafire.com/file/example1/file.mcpack"),
    dateAdded: "2025-03-15",
    lastUpdated: "2025-03-15",
    changelog: [
      { version: "v1.0", note: "Initial release" }
    ],
    featured: true
  },
  {
    id: "cartoon-fun-pack",
    name: "Cartoon Fun Pack",
    category: "texture",
    tags: ["Cartoon", "Colorful", "Fun"],
    thumbnail: "images/cartoon-fun-thumb.jpg",
    screenshot: "images/cartoon-fun-ss.jpg",
    description: "Bright and colorful cartoon-style texture pack! Perfect for all ages, especially kids. Gives a fun and unique look to your Minecraft world.",
    mcpeVersion: "1.19 - 1.21",
    fileSize: "12 MB",
    downloadTime: "~30 seconds",
    installTime: "~2 minutes",
    downloadUrl: btoa("https://www.mediafire.com/file/example2/file.mcpack"),
    dateAdded: "2025-03-10",
    lastUpdated: "2025-03-10",
    changelog: [
      { version: "v1.0", note: "Initial release" }
    ],
    featured: false
  },
  {
    id: "medieval-kingdoms",
    name: "Medieval Kingdoms",
    category: "texture",
    tags: ["Medieval", "Dark", "RPG"],
    thumbnail: "images/medieval-thumb.jpg",
    screenshot: "images/medieval-ss.jpg",
    description: "Experience the atmosphere of a medieval kingdom with this texture pack. Every block is redesigned with detailed brickwork, aged wood, and rusted metal that makes you feel like you're truly in a medieval world.",
    mcpeVersion: "1.20 - 1.21",
    fileSize: "28 MB",
    downloadTime: "~45 seconds",
    installTime: "~2 minutes",
    downloadUrl: btoa("https://www.mediafire.com/file/example3/file.mcpack"),
    dateAdded: "2025-03-18",
    lastUpdated: "2025-03-18",
    changelog: [
      { version: "v1.0", note: "Initial release" }
    ],
    featured: false
  },
  {
    id: "horror-night-pack",
    name: "Horror Night Pack",
    category: "texture",
    tags: ["Horror", "Dark", "Scary"],
    thumbnail: "images/horror-thumb.jpg",
    screenshot: "images/horror-ss.jpg",
    description: "Turn your Minecraft world into a terrifying place! This horror texture pack brings a dark, mysterious, and spine-chilling atmosphere. Play at night for the best experience.",
    mcpeVersion: "1.20 - 1.21",
    fileSize: "18 MB",
    downloadTime: "~35 seconds",
    installTime: "~2 minutes",
    downloadUrl: btoa("https://www.mediafire.com/file/example4/file.mcpack"),
    dateAdded: "2025-03-20",
    lastUpdated: "2025-03-20",
    changelog: [
      { version: "v1.0", note: "Initial release" }
    ],
    featured: false
  },
  {
    id: "more-tools-addon",
    name: "More Tools Addon",
    category: "addon",
    tags: ["Tools", "Survival", "Craft"],
    thumbnail: "images/more-tools-thumb.jpg",
    screenshot: "images/more-tools-ss.jpg",
    description: "Add over 30 new tools to Minecraft! From giant hoes, fire swords, to super-fast mining tools. All fully integrated with the vanilla crafting system.",
    mcpeVersion: "1.20 - 1.21",
    fileSize: "8 MB",
    downloadTime: "~20 seconds",
    installTime: "~1 minute",
    downloadUrl: btoa("https://www.mediafire.com/file/example5/file.mcaddon"),
    dateAdded: "2025-03-12",
    lastUpdated: "2025-03-12",
    changelog: [
      { version: "v2.0", note: "Added 10 new tools" },
      { version: "v1.0", note: "Initial release" }
    ],
    featured: true
  },
  {
    id: "epic-bosses-addon",
    name: "Epic Bosses Addon",
    category: "addon",
    tags: ["Boss", "Combat", "Challenge"],
    thumbnail: "images/epic-bosses-thumb.jpg",
    screenshot: "images/epic-bosses-ss.jpg",
    description: "Face 5 epic new bosses each with unique abilities and rare item drops! Perfect for players who find Minecraft too easy. You'll need teamwork to defeat them all.",
    mcpeVersion: "1.20 - 1.21",
    fileSize: "15 MB",
    downloadTime: "~30 seconds",
    installTime: "~2 minutes",
    downloadUrl: btoa("https://www.mediafire.com/file/example6/file.mcaddon"),
    dateAdded: "2025-03-08",
    lastUpdated: "2025-03-19",
    changelog: [
      { version: "v1.2", note: "Fixed boss spawn bug" },
      { version: "v1.1", note: "Added 2 new bosses" },
      { version: "v1.0", note: "Initial release" }
    ],
    featured: false
  }
];
