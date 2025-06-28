export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export type Quiz = {
  id: string;
  title: string;
  points: number;
  questions: QuizQuestion[];
};

export const quizData: Quiz[] = [
  {
    id: 'basic',
    title: 'Rock Basic Quiz',
    points: 30,
    questions: [
      {
        question: 'What type of rock is formed from cooled magma?',
        options: ['Igneous', 'Sedimentary', 'Metamorphic', 'Limestone'],
        correctAnswer: 'Igneous',
      },
      {
        question: 'Which of the following is a sedimentary rock?',
        options: ['Granite', 'Basalt', 'Sandstone', 'Marble'],
        correctAnswer: 'Sandstone',
      },
      {
        question: 'Which rock is commonly used in chalk?',
        options: ['Granite', 'Limestone', 'Basalt', 'Quartz'],
        correctAnswer: 'Limestone',
      },
    ],
  },
  {
    id: 'intermediate',
    title: 'Rock Intermediate Quiz',
    points: 50,
    questions: [
      {
        question: 'What process transforms sediment into sedimentary rock?',
        options: ['Erosion', 'Melting', 'Lithification', 'Evaporation'],
        correctAnswer: 'Lithification',
      },
      {
        question: 'Marble is a metamorphic form of which rock?',
        options: ['Limestone', 'Granite', 'Basalt', 'Quartzite'],
        correctAnswer: 'Limestone',
      },
      {
        question: 'Which of the following rocks has the highest silica content?',
        options: ['Basalt', 'Rhyolite', 'Granite', 'Gabbro'],
        correctAnswer: 'Granite',
      },
    ],
  },
  {
    id: 'trivella',
    title: 'Mountain Rock Trivella',
    points: 25,
    questions: [
      {
        question: 'Which mountain contains mostly metamorphic rocks?',
        options: ['Mount Everest', 'Rocky Mountains', 'Andes', 'Alps'],
        correctAnswer: 'Alps',
      },
      {
        question: 'Which rock type is most common in mountain roots?',
        options: ['Metamorphic', 'Igneous', 'Sedimentary', 'Fossiliferous'],
        correctAnswer: 'Metamorphic',
      },
    ],
  },
];
