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
    title: "What are the type of geological rocks?",
    category: "Beginner",
    preview:
      "Geological rocks are classified into three main types based on their formation process. Igneous rocks are formed from cooled molten lava or magma, resulting in solid, crystalline structures. Sedimentary rocks are created from accumulated particles like sand, silt, and organic material, compacted over millions of years. Metamorphic rocks originate when existing rocks undergo extreme heat and pressure, altering their physical and chemical properties, producing entirely new rock formations.",
    likes: 999,
    liked: false,
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
      "Advanced mineral identification involves a combination of physical observation and specialized testing. Experts examine crystal form, hardness, luster, streak, and cleavage to differentiate minerals. In modern laboratories, X-ray diffraction and electron microprobe analysis provide detailed compositional data. Proper identification ensures accurate classification, valuable for academic research, industrial applications, and geological surveys essential for resource exploration.",
    likes: 892,
    liked: false,
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
      "Fossil hunting offers a fascinating window into Earth's ancient history. Successful hunting begins with researching fossil-rich areas, often sedimentary rock formations. Essential tools include rock hammers, chisels, brushes, and protective gear. Patience is crucial as fossils are carefully extracted to prevent damage. Always respect legal regulations and preserve the natural environment. Every discovered fossil contributes valuable knowledge to science, helping paleontologists reconstruct life from millions of years ago.",
    likes: 2100,
    liked: false,
  },
];
