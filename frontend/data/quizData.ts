export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
<<<<<<< HEAD
  points?: number;
=======
>>>>>>> origin/kenneth-final
};

export type Quiz = {
  id: string;
  title: string;
  points: number;
<<<<<<< HEAD
  category?: string[];
  difficulty?: "Basic" | "Intermediate" | "Advance" | "Fun Fact";
  thumbnail?: string;
=======
>>>>>>> origin/kenneth-final
  questions: QuizQuestion[];
};

export const quizData: Quiz[] = [
  {
    id: 'basic',
    title: 'Rock Basic Quiz',
    points: 30,
<<<<<<< HEAD
    difficulty: 'Basic',
    category: ['Igneous Rock'],
=======
>>>>>>> origin/kenneth-final
    questions: [
      {
        question: 'What type of rock is formed from cooled magma?',
        options: ['Igneous', 'Sedimentary', 'Metamorphic', 'Limestone'],
        correctAnswer: 'Igneous',
<<<<<<< HEAD
        points: 10
=======
>>>>>>> origin/kenneth-final
      },
      {
        question: 'Which of the following is a sedimentary rock?',
        options: ['Granite', 'Basalt', 'Sandstone', 'Marble'],
        correctAnswer: 'Sandstone',
<<<<<<< HEAD
        points: 10
=======
>>>>>>> origin/kenneth-final
      },
      {
        question: 'Which rock is commonly used in chalk?',
        options: ['Granite', 'Limestone', 'Basalt', 'Quartz'],
        correctAnswer: 'Limestone',
<<<<<<< HEAD
        points: 10
      }
    ]
=======
      },
    ],
>>>>>>> origin/kenneth-final
  },
  {
    id: 'intermediate',
    title: 'Rock Intermediate Quiz',
    points: 50,
<<<<<<< HEAD
    difficulty: 'Intermediate',
    category: ['Sedimentary Rock', 'Metamorphic Rock'],
=======
>>>>>>> origin/kenneth-final
    questions: [
      {
        question: 'What process transforms sediment into sedimentary rock?',
        options: ['Erosion', 'Melting', 'Lithification', 'Evaporation'],
        correctAnswer: 'Lithification',
<<<<<<< HEAD
        points: 20
=======
>>>>>>> origin/kenneth-final
      },
      {
        question: 'Marble is a metamorphic form of which rock?',
        options: ['Limestone', 'Granite', 'Basalt', 'Quartzite'],
        correctAnswer: 'Limestone',
<<<<<<< HEAD
        points: 15
=======
>>>>>>> origin/kenneth-final
      },
      {
        question: 'Which of the following rocks has the highest silica content?',
        options: ['Basalt', 'Rhyolite', 'Granite', 'Gabbro'],
        correctAnswer: 'Granite',
<<<<<<< HEAD
        points: 15
      }
    ]
=======
      },
    ],
>>>>>>> origin/kenneth-final
  },
  {
    id: 'trivella',
    title: 'Mountain Rock Trivella',
    points: 25,
<<<<<<< HEAD
    difficulty: 'Fun Fact',
    category: ['Metamorphic Rock'],
=======
>>>>>>> origin/kenneth-final
    questions: [
      {
        question: 'Which mountain contains mostly metamorphic rocks?',
        options: ['Mount Everest', 'Rocky Mountains', 'Andes', 'Alps'],
        correctAnswer: 'Alps',
<<<<<<< HEAD
        points: 12
=======
>>>>>>> origin/kenneth-final
      },
      {
        question: 'Which rock type is most common in mountain roots?',
        options: ['Metamorphic', 'Igneous', 'Sedimentary', 'Fossiliferous'],
        correctAnswer: 'Metamorphic',
<<<<<<< HEAD
        points: 13
      }
    ]
  }
=======
      },
    ],
  },
>>>>>>> origin/kenneth-final
];
