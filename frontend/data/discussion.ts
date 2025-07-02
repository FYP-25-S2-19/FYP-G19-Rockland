export type Comment = {
  id: number;
  user: string;
  time: string;
  text: string;
  replyTo?: number;
};

export type Discussion = {
  id: number;
  user: string;
  timestamp: string;
  text: string;
  comments: Comment[];
  isNew: boolean;
};

export const sampleDiscussions: Discussion[] = [
  {
    id: 1,
    user: "Elara",
    timestamp: "5 mins ago",
    text: "How do different types of rocks help us understand Earth's history?",
    comments: [
      {
        id: 1,
        user: "Emma Thompson",
        time: "30 min ago",
        text: "Amazing! I collected a rock like this during my trip to Iceland...",
      },
      {
        id: 2,
        user: "Marcus Johnson",
        time: "15 min ago",
        text: "Totally agree! Volcanic rocks from Iceland are incredible...",
        replyTo: 1,
      },
    ],
    isNew: true,
  },
  {
    id: 2,
    user: "Esther",
    timestamp: "30 mins ago",
    text: "How can we use rocks more sustainably in construction and development?",
    comments: [
      {
        id: 1,
        user: "Liam Tan",
        time: "25 min ago",
        text: "Recycling concrete and using local materials is a good start!",
      },
    ],
    isNew: true,
  },
  {
    id: 3,
    user: "Lily",
    timestamp: "1 hr ago",
    text: "Why is it important to study rocks in fields like archaeology and engineering?",
    comments: [
      {
        id: 1,
        user: "Noah Patel",
        time: "45 min ago",
        text: "Rocks tell us about past civilizations and are key for tunnel design!",
      },
      {
        id: 2,
        user: "Jia Wei",
        time: "30 min ago",
        text: "Exactly. Rock layers can even indicate ancient human activity zones.",
        replyTo: 1,
      },
    ],
    isNew: false,
  },
  {
    id: 4,
    user: "Marcus",
    timestamp: "2 hr ago",
    text: "What’s the difference between igneous, sedimentary, and metamorphic rocks?",
    comments: [
      {
        id: 1,
        user: "Sara Lim",
        time: "1 hr ago",
        text: "Igneous forms from magma, sedimentary from deposits, and metamorphic from pressure + heat.",
      },
    ],
    isNew: false,
  },
  {
    id: 5,
    user: "Sofia",
    timestamp: "3 hr ago",
    text: "Can anyone explain how plate tectonics affects rock formation?",
    comments: [
      {
        id: 1,
        user: "Daniel",
        time: "2 hr ago",
        text: "Tectonic collisions create mountains and metamorphic rocks!",
      },
      {
        id: 2,
        user: "Nina Yeo",
        time: "90 min ago",
        text: "Don’t forget: subduction zones also create volcanic igneous rocks.",
        replyTo: 1,
      },
    ],
    isNew: false,
  },
];
