export interface Feedback {
  id: string;
  authorName: string;
  authorTagline: string;
  authorAvatar: string;
  date: string;
  quote: string;
  twitterVerified?: boolean;
  url: string;
}

export const FEEDBACKS: Feedback[] = [
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1924669182618021888/a6Ccf201_400x400.jpg",
    authorName: "@tomasholtz_",
    authorTagline: "Founding Engineer @belo_app",
    date: "30-03-2026",
    id: "tomasholtz",
    quote: "Muy bueno loko, hay link?",
    twitterVerified: true,
    url: "https://x.com/tomasholtz_/status/2038757785064686052",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1998237655063257088/o5zyt_vG_400x400.jpg",
    authorName: "@evilrabbit_",
    authorTagline: "Founding Designer @vercel",
    date: "30-03-2026",
    id: "evilrabbit",
    quote: "Belleza.",
    twitterVerified: true,
    url: "https://x.com/evilrabbit_/status/2038750038181257249",
  },
  {
    authorAvatar:
      "https://pbs.twimg.com/profile_images/1733687777034690560/fFnpw5Sq_400x400.jpg",
    authorName: "@pheralb_",
    authorTagline: "Builder @svgl.app",
    date: "30-03-2026",
    id: "pheralb",
    quote: "Me encanta",
    url: "https://x.com/pheralb_/status/2038938436296397198",
  },
];
