// data/rocks.ts

export type RockComment = {
  id: number;
  user: string;
  time: string;
  text: string;
  likes: number;
  replies?: RockComment[];
};

export type Rock = {
  id: string;
  name: string;
  type: string;
  image: any;
  rarity: string;
  description: string;
  properties: {
    [key: string]: string;
  };
  commonLocations: string[];
  funFact: string;
  comments: RockComment[];
};

export const rockData: Rock[] = [
  {
    id: 'granite',
    name: 'Granite',
    type: 'Igneous',
    image: require('../assets/images/granite.png'),
    rarity: 'Common',
    description:
      'Granite is a coarse-grained igneous rock composed mostly of quartz, alkali feldspar, and plagioclase.',
    properties: {
      Color: 'Light-colored',
      Hardness: '6-7',
      Composition: 'Quartz, Feldspar',
      Density: '2.63–2.75 g/cm³',
    },
    commonLocations: ['Mount Rushmore', 'Sierra Nevada', 'Scotland'],
    funFact:
      'Granite is often used in buildings and monuments due to its durability.',
    comments: [
      {
        id: 1,
        user: 'Alex Rodriguez',
        time: '1 hour ago',
        text: 'I saw granite formations like this in Yosemite!',
        likes: 8,
        replies: [
          {
            id: 2,
            user: 'Emma Thompson',
            time: '40 min ago',
            text: 'Same! The texture is so distinct.',
            likes: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'limestone',
    name: 'Limestone',
    type: 'Sedimentary',
    image: require('../assets/images/limestone.png'),
    rarity: 'Common',
    description:
      'Limestone is a sedimentary rock composed mainly of calcium carbonate.',
    properties: {
      Color: 'White, gray, or tan',
      Hardness: '3-4',
      Composition: 'Calcite',
      Density: '2.3–2.7 g/cm³',
    },
    commonLocations: ['Indiana', 'Egypt', 'France'],
    funFact: 'Limestone forms in marine environments and can contain fossils.',
    comments: [],
  },
  {
    id: 'basalt',
    name: 'Basalt',
    type: 'Igneous',
    image: require('../assets/images/basalt.png'),
    rarity: 'Rare',
    description:
      'Basalt is a dark-colored, fine-grained volcanic rock that is often found in oceanic crust.',
    properties: {
      Color: 'Dark gray to black',
      Hardness: '6',
      Composition: 'Pyroxene, Plagioclase',
      Density: '2.8–3.0 g/cm³',
    },
    commonLocations: ['Hawaii', 'Iceland', 'Columbia River Plateau'],
    funFact: 'Basalt is the most common rock type in the Earth’s crust.',
    comments: [
      {
        id: 3,
        user: 'Liam Chen',
        time: '20 min ago',
        text: 'The basalt cliffs in Iceland are stunning!',
        likes: 4,
        replies: [],
      },
    ],
  },
  {
    id: 'quartzite',
    name: 'Quartzite',
    type: 'Metamorphic',
    image: require('../assets/images/quartzite.png'),
    rarity: 'Legendary',
    description: 'Quartzite is a hard metamorphic rock formed from sandstone.',
    properties: {
      Color: 'White, gray, pink',
      Hardness: '7',
      Composition: 'Quartz',
      Density: '2.6–2.7 g/cm³',
    },
    commonLocations: ['Appalachian Mountains', 'South Dakota', 'Brazil'],
    funFact:
      'Quartzite is resistant to weathering and often used as a decorative stone.',
    comments: [],
  },
];
