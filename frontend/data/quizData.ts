export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  points?: number;
};

export type Quiz = {
  id: string;
  title: string;
  points: number;
  category?: string[];
  difficulty?: "Basic" | "Intermediate" | "Advance" | "Fun Fact";
  thumbnail?: string;
  questions: QuizQuestion[];
};

export const quizData: Quiz[] = [
  {
    id: 'basic',
    title: 'Rock Basic Quiz',
    points: 30,
    difficulty: 'Basic',
    category: ['Igneous Rock'],
    questions: [
      {
        question: 'What type of rock is formed from cooled magma?',
        options: ['Igneous', 'Sedimentary', 'Metamorphic', 'Limestone'],
        correctAnswer: 'Igneous',
        points: 10
      },
      {
        question: 'Which of the following is a sedimentary rock?',
        options: ['Granite', 'Basalt', 'Sandstone', 'Marble'],
        correctAnswer: 'Sandstone',
        points: 10
      },
      {
        question: 'Which rock is commonly used in chalk?',
        options: ['Granite', 'Limestone', 'Basalt', 'Quartz'],
        correctAnswer: 'Limestone',
        points: 10
      }
    ]
  },
  {
    id: 'intermediate',
    title: 'Rock Intermediate Quiz',
    points: 50,
    difficulty: 'Intermediate',
    category: ['Sedimentary Rock', 'Metamorphic Rock'],
    questions: [
      {
        question: 'What process transforms sediment into sedimentary rock?',
        options: ['Erosion', 'Melting', 'Lithification', 'Evaporation'],
        correctAnswer: 'Lithification',
        points: 20
      },
      {
        question: 'Marble is a metamorphic form of which rock?',
        options: ['Limestone', 'Granite', 'Basalt', 'Quartzite'],
        correctAnswer: 'Limestone',
        points: 15
      },
      {
        question: 'Which of the following rocks has the highest silica content?',
        options: ['Basalt', 'Rhyolite', 'Granite', 'Gabbro'],
        correctAnswer: 'Granite',
        points: 15
      }
    ]
  },
  {
    id: 'trivella',
    title: 'Mountain Rock Trivella',
    points: 25,
    difficulty: 'Fun Fact',
    category: ['Metamorphic Rock'],
    questions: [
      {
        question: 'Which mountain contains mostly metamorphic rocks?',
        options: ['Mount Everest', 'Rocky Mountains', 'Andes', 'Alps'],
        correctAnswer: 'Alps',
        points: 12
      },
      {
        question: 'Which rock type is most common in mountain roots?',
        options: ['Metamorphic', 'Igneous', 'Sedimentary', 'Fossiliferous'],
        correctAnswer: 'Metamorphic',
        points: 13
      }
    ]
  }
];
