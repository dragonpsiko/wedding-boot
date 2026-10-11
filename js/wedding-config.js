const WEDDING_CONFIG = {
  // --- INFORMASI MEMPELAI ---
  groomName: "Rian",
  brideName: "Sarah",
  coupleInitials: "S & R",
  weddingDate: "12 November 2026",
  hashtag: "#SarahRianStory",
  greetingTitle: "Selamat Datang di Resepsi Kami",
  greetingMessage: "Terima kasih telah hadir dan berbagi kebahagiaan bersama kami. Abadikan momen manismu di photobooth ini!",

  // --- VISUAL & TEMA (Aesthetic & Elegant) ---
  heroPhoto: "assets/wedding/hero.jpg", 
  themeColor: "#8C7A6B", 
  
  // --- INTEGRASI GOOGLE APPS SCRIPT (Album Digital Klien) ---
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbxqpzt_QnpnoseolW4N8j97cvItqRDbjvcfXIDINh_OQQCpTtdbTwOwycvFhpq4L_tv/exec",

  // --- CONFIG FRAME KHUSUS WEDDING (Satu Frame Utama) ---
  frame: {
    id: "wedding_classic",
    name: "Classic Wedding Strip",
    src: "assets/wedding/frame_wedding.png",
    posesCount: 3,
    renderWidth: 1080,
    renderHeight: 3240,
    slots: [
      { x: 54, y: 180,  w: 972, h: 810 },
      { x: 54, y: 1125, w: 972, h: 810 },
      { x: 54, y: 2070, w: 972, h: 810 }
    ]
  }
};
