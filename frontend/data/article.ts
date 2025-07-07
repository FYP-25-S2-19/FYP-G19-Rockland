import profilePicture from "../assets/images/profilepicture.png";
import article1 from "../assets/images/article1.png";
import article2 from "../assets/images/article2.png";
import article3 from "../assets/images/article3.png";

export const sampleArticles = [
  {
    id: 1,
    authorName: "Song Kim",
    authorImage: profilePicture,
    isPremium: false,
    thumbnail: article1,
    title: "What are the type of geological rocks that appear in singapore?",
    category: "Beginner",
    preview:
      "Geological rocks are classified into three main types based on their formation process...",
    likes: 999,
    liked: false,
    date: "2025-06-15T10:30:00Z", // <-- Add proper date
  },
  {
    id: 2,
    authorName: "Dr. Sarah Johnson",
    authorImage: profilePicture,
    isPremium: true,
    thumbnail: article2,
    title: "Advanced Mineral Identification",
    category: "Advanced",
    preview:
      "Advanced mineral identification involves a combination of physical observation and specialized testing...",
    likes: 892,
    liked: false,
    date: "2025-06-28T14:45:00Z", // <-- Add proper date
  },
  {
    id: 3,
    authorName: "Mike Chen",
    authorImage: profilePicture,
    isPremium: false,
    thumbnail: article3,
    title: "Fossil Hunting Guide",
    category: "Fossils",
    preview:
      "Fossil hunting offers a fascinating window into Earth's ancient history...",
    likes: 2100,
    liked: false,
    date: "2025-07-01T08:20:00Z", // <-- Add proper date
  },
  {
    id: 4,
    authorName: "Test",
    authorImage: profilePicture,
    isPremium: false,
    thumbnail: article1,
    title: "Just Tsting",
    category: "Minerals",
    preview:
      "Fossil hunting offers a fascinating window into Earth's ancient history...",
    likes: 0,
    liked: false,
    date: "2025-07-01T08:20:00Z", // <-- Add proper date
  },
  {
    id: 5,
    authorName: "Test1",
    authorImage: profilePicture,
    isPremium: false,
    thumbnail: article2,
    title: "Fossil Hunting Guide",
    category: "Test",
    preview:
      "Fossil hunting offers a fascinating window into Earth's ancient history...",
    likes: 0,
    liked: false,
    date: "2025-07-01T08:20:00Z", // <-- Add proper date
  },
];