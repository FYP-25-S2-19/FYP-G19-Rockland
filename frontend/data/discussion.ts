export interface Comment {
  id: number;
  user: string;
  time: string;
  text: string;
  replyTo?: number;
}

export interface Discussion {
  id: number;
  user: string;
  timestamp: string;
  text: string;
  comments: Comment[];
  isNew: boolean;
}

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
  // ...more discussions
];
