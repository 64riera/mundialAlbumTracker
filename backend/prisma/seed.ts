import { PrismaClient, SectionType, StickerType } from "@prisma/client";

const prisma = new PrismaClient();

interface TeamData {
  code: string;
  name: string;
  flag: string;
  confederation: string;
  players: string[];
}

const FWC_STICKERS = [
  { code: "FWC-1", name: "WC Logo" },
  { code: "FWC-2", name: "WC Logo" },
  { code: "FWC-3", name: "Mascotas Oficiales" },
  { code: "FWC-4", name: "Eslogan Oficial" },
  { code: "FWC-5", name: "Balón Oficial" },
  { code: "FWC-6", name: "Canadá — Emblema País Sede" },
  { code: "FWC-7", name: "México — Emblema País Sede" },
  { code: "FWC-8", name: "USA — Emblema País Sede" },
];

const COCA_COLA_STICKERS = [
  { code: "CC-1", name: "Lamine Yamal" },
  { code: "CC-2", name: "Joshua Kimmich" },
  { code: "CC-3", name: "Eduardo Camavinga" },
  { code: "CC-4", name: "Joško Gvardiol" },
  { code: "CC-5", name: "Federico Valverde" },
  { code: "CC-6", name: "Virgil van Dijk" },
  { code: "CC-7", name: "Alphonso Davies" },
  { code: "CC-8", name: "Raúl Jiménez" },
  { code: "CC-9", name: "William Saliba" },
  { code: "CC-10", name: "Lautaro Martínez" },
  { code: "CC-11", name: "Harry Kane" },
  { code: "CC-12", name: "Antonee Robinson" },
];

// 47 teams in album order — 18 players each (positions 2-12 and 14-20)
const TEAMS: TeamData[] = [
  {
    code: "MEX",
    name: "México",
    flag: "🇲🇽",
    confederation: "CONCACAF",
    players: [
      "Luis Malagón", "Johan Vásquez", "Jorge Sánchez", "César Montes",
      "Jesús Gallardo", "Israel Reyes", "Diego Lainez", "Carlos Rodríguez",
      "Edson Álvarez", "Orbelin Pineda", "Marcel Ruiz",
      "Érick Sánchez", "Hirving Lozano", "Santiago Giménez", "Raúl Jiménez",
      "Alexis Vega", "Roberto Alvarado", "César Huerta",
    ],
  },
  {
    code: "RSA",
    name: "Sudáfrica",
    flag: "🇿🇦",
    confederation: "CAF",
    players: [
      "Ronwen Williams", "Sipho Chaine", "Aubrey Modiba", "Samukele Kabini",
      "Khuliso Mudau", "Khulumani Ndamane", "Siyabonga Ngezana", "Khuliso Mudau",
      "Nkosinathi Sibisi", "Teboho Mokoena", "Thalente Mbatha",
      "Bathusi Aubaas", "Yaya Sithole", "Sipho Mbule", "Lyle Foster",
      "Iqraam Rayners", "Mohau Nkota", "Oswin Appollis",
    ],
  },
  {
    code: "KOR",
    name: "Corea del Sur",
    flag: "🇰🇷",
    confederation: "AFC",
    players: [
      "Hyeonwoo Jo", "Seunggyu Kim", "Minjae Kim", "Yumin Cho",
      "Youngwoo Seol", "Hanbeom Lee", "Taeseok Lee", "Myungjae Lee",
      "Jaesung Lee", "Inbeom Hwang", "Kangin Lee",
      "Seungho Paik", "Jens Castrop", "Donggyeong Lee", "Guesung Cho",
      "Heungmin Son", "Heechan Hwang", "Hyeongyu Oh",
    ],
  },
  {
    code: "CZE",
    name: "Chequia",
    flag: "🇨🇿",
    confederation: "UEFA",
    players: [
      "Matěj Kovář", "Jindřich Staněk", "Ladislav Krejčí", "Vladimír Coufal",
      "Jaroslav Zelený", "Tomáš Holeš", "David Zima", "Michal Sadílek",
      "Lukáš Provod", "Lukáš Červ", "Tomáš Souček",
      "Pavel Šulc", "Matěj Vydra", "Vasil Kušej", "Tomáš Chorý",
      "Václav Černý", "Adam Hložek", "Patrik Schick",
    ],
  },
  {
    code: "CAN",
    name: "Canadá",
    flag: "🇨🇦",
    confederation: "CONCACAF",
    players: [
      "Dayne St. Clair", "Alphonso Davies", "Alistair Johnston", "Samuel Adekugbe",
      "Richie Laryea", "Derek Cornelius", "Moïse Bombito", "Kamal Miller",
      "Stephen Eustáquio", "Ismaël Koné", "Jonathan Osorio",
      "Jacob Shaffelburg", "Mathieu Choinière", "Niko Sigur", "Tajon Buchanan",
      "Liam Millar", "Cyle Larin", "Jonathan David",
    ],
  },
  {
    code: "BIH",
    name: "Bosnia-Herzegovina",
    flag: "🇧🇦",
    confederation: "UEFA",
    players: [
      "Nikola Vasiljević", "Amar Dedić", "Sead Kolašinac", "Tarik Muharemović",
      "Nihad Mujakić", "Nikola Katić", "Amir Hadžiahmetović", "Benjamin Tahirović",
      "Armin Gigović", "Ivan Šunjić", "Ivan Bašić",
      "Dženis Burnić", "Esmir Bajraktarević", "Amar Memić", "Ermedin Demirović",
      "Edin Džeko", "Samed Baždar", "Haris Tabaković",
    ],
  },
  {
    code: "QAT",
    name: "Catar",
    flag: "🇶🇦",
    confederation: "AFC",
    players: [
      "Meshaal Barsham", "Sultan Al-Brake", "Lucas Mendes", "Homam Ahmed",
      "Boualem Khoukhi", "Pedro Miguel", "Tarek Salman", "Mohammed Mannai",
      "Karim Boudiaf", "Assim Madibo", "Hamed Fatehi",
      "Mohammed Waad", "Abdulaziz Hatem", "Hassan Al-Haydos", "Edmilson Junior",
      "Akram Hassan Afif", "Ahmed Al-Ganehi", "Almoez Ali",
    ],
  },
  {
    code: "SUI",
    name: "Suiza",
    flag: "🇨🇭",
    confederation: "UEFA",
    players: [
      "Gregor Kobel", "Yvon Mvogo", "Manuel Akanji", "Ricardo Rodríguez",
      "Nico Elvedi", "Aurèle Amenda", "Silvan Widmer", "Granit Xhaka",
      "Denis Zakaria", "Remo Freuler", "Fabian Rieder",
      "Ardon Jashari", "Johan Manzambi", "Michel Aebischer", "Breel Embolo",
      "Rubén Vargas", "Dan Ndoye", "Zeki Amdouni",
    ],
  },
  {
    code: "BRA",
    name: "Brasil",
    flag: "🇧🇷",
    confederation: "CONMEBOL",
    players: [
      "Alisson", "Bento", "Marquinhos", "Éder Militão",
      "Gabriel Magalhães", "Danilo", "Wesley", "Lucas Paquetá",
      "Casemiro", "Bruno Guimarães", "Luiz Henrique",
      "Vinícius Júnior", "Rodrygo", "João Pedro", "Matheus Cunha",
      "Gabriel Martinelli", "Raphinha", "Estêvão",
    ],
  },
  {
    code: "MAR",
    name: "Marruecos",
    flag: "🇲🇦",
    confederation: "CAF",
    players: [
      "Yassine Bounou", "Munir El Kajoui", "Achraf Hakimi", "Noussair Mazraoui",
      "Nayef Aguerd", "Romain Saïss", "Jawad El Yamiq", "Adam Masina",
      "Sofyan Amrabat", "Azzedine Ounahi", "Eliesse Ben Seghir",
      "Bilal El Khannouss", "Ismael Saibari", "Youssef En-Nesyri", "Abde Ezzalzouli",
      "Soufiane Rahimi", "Brahim Díaz", "Ayoub El Kaabi",
    ],
  },
  {
    code: "HAI",
    name: "Haití",
    flag: "🇭🇹",
    confederation: "CONCACAF",
    players: [
      "Johny Placide", "Carlens Arcus", "Martin Expérience", "Jean-Kévin Duverne",
      "Ricardo Adé", "Duke Lacroix", "Garven Metusala", "Hannes Delcroix",
      "Leverton Pierre", "Danley Jean Jacques", "Jean-Ricner Bellegarde",
      "Christopher Attys", "Derrick Etienne Jr.", "Josué Casimir", "Ruben Providence",
      "Duckens Nazon", "Louicius Deedson", "Frantzdy Pierrot",
    ],
  },
  {
    code: "SCO",
    name: "Escocia",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    confederation: "UEFA",
    players: [
      "Angus Gunn", "Jack Hendry", "Kieran Tierney", "Aaron Hickey",
      "Andrew Robertson", "Scott McKenna", "John Souttar", "Anthony Ralston",
      "Grant Hanley", "Scott McTominay", "Billy Gilmour",
      "Lewis Ferguson", "Ryan Christie", "Kenny McLean", "John McGinn",
      "Lyndon Dykes", "Ché Adams", "Ben Doak",
    ],
  },
  {
    code: "USA",
    name: "Estados Unidos",
    flag: "🇺🇸",
    confederation: "CONCACAF",
    players: [
      "Matt Freese", "Chris Richards", "Tim Ream", "Mark McKenzie",
      "Alex Freeman", "Antonee Robinson", "Tyler Adams", "Tanner Tessmann",
      "Weston McKennie", "Christian Roldan", "Timothy Weah",
      "Diego Luna", "Malik Tillman", "Christian Pulisic", "Brenden Aaronson",
      "Ricardo Pepi", "Haji Wright", "Folarin Balogun",
    ],
  },
  {
    code: "PAR",
    name: "Paraguay",
    flag: "🇵🇾",
    confederation: "CONMEBOL",
    players: [
      "Roberto Fernández", "Orlando Gill", "Diego Gómez", "Fabián Balbuena",
      "Juan José Cáceres", "Omar Alderete", "Júnior Alonso", "Mathías Villasanti",
      "Diego Gómez", "Damián Bobadilla", "Andrés Cubas",
      "Matías Galarza Fonda", "Julio Enciso", "Alejandro Romero Gamarra", "Miguel Almirón",
      "Ramón Sosa", "Ángel Romero", "Antonio Sanabria",
    ],
  },
  {
    code: "AUS",
    name: "Australia",
    flag: "🇦🇺",
    confederation: "AFC",
    players: [
      "Mathew Ryan", "Joe Gauci", "Harry Souttar", "Alessandro Circati",
      "Jordan Bos", "Aziz Behich", "Cameron Burgess", "Lewis Miller",
      "Milos Degenek", "Jackson Irvine", "Riley McGree",
      "Aiden O'Neill", "Connor Metcalfe", "Patrick Yazbek", "Craig Goodwin",
      "Kusini Yengi", "Nestory Irankunda", "Mohamed Touré",
    ],
  },
  {
    code: "TUR",
    name: "Turquía",
    flag: "🇹🇷",
    confederation: "UEFA",
    players: [
      "Uğurcan Çakır", "Mert Müldür", "Zeki Çelik", "Abdülkerim Bardakçı",
      "Çağlar Söyüncü", "Merih Demiral", "Ferdi Kadıoğlu", "Kaan Ayhan",
      "İsmail Yüksek", "Hakan Çalhanoğlu", "Orkun Kökçü",
      "Arda Güler", "İrfan Can Kahveci", "Yunus Akgün", "Can Uzun",
      "Barış Alper Yılmaz", "Kerem Aktürkoğlu", "Kenan Yıldız",
    ],
  },
  {
    code: "GER",
    name: "Alemania",
    flag: "🇩🇪",
    confederation: "UEFA",
    players: [
      "Marc-André ter Stegen", "Jonathan Tah", "David Raum", "Nico Schlotterbeck",
      "Antonio Rüdiger", "Waldemar Anton", "Ridle Baku", "Maximilian Mittelstädt",
      "Joshua Kimmich", "Florian Wirtz", "Felix Nmecha",
      "Leon Goretzka", "Jamal Musiala", "Serge Gnabry", "Kai Havertz",
      "Leroy Sané", "Karim Adeyemi", "Nick Woltemade",
    ],
  },
  {
    code: "CUW",
    name: "Curazao",
    flag: "🇨🇼",
    confederation: "CONCACAF",
    players: [
      "Eloy Room", "Armando Obispo", "Sherel Floranus", "Juriën Gaari",
      "Joshua Brenet", "Roshon van Eijma", "Shurandy Sambo", "Livano Comenencia",
      "Godfried Roemeratoe", "Juninho Bacuna", "Leandro Bacuna",
      "Tahith Chong", "Kenji Gorré", "Jearl Margaritha", "Jürgen Locadia",
      "Jeremy Antonisse", "Gervane Kastaneer", "Sontje Hansen",
    ],
  },
  {
    code: "CIV",
    name: "Costa de Marfil",
    flag: "🇨🇮",
    confederation: "CAF",
    players: [
      "Yahia Fofana", "Ghislain Konan", "Wilfried Singo", "Odilon Kossounou",
      "Evan Ndicka", "Willy Boly", "Emmanuel Agbadou", "Ousmane Diomandé",
      "Franck Kessié", "Seko Fofana", "Ibrahim Sangaré",
      "Jean-Philippe Gbamin", "Amad Diallo", "Sébastien Haller", "Simon Adingra",
      "Yan Diomandé", "Evann Guessand", "Oumar Diakité",
    ],
  },
  {
    code: "ECU",
    name: "Ecuador",
    flag: "🇪🇨",
    confederation: "CONMEBOL",
    players: [
      "Hernán Galíndez", "Gonzalo Valle", "Piero Hincapié", "Pervis Estupiñán",
      "Willian Pacho", "Ángelo Preciado", "Joel Ordóñez", "Moisés Caicedo",
      "Alan Franco", "Kendry Páez", "Pedro Vite",
      "John Yeboah", "Leonardo Campana", "Gonzalo Plata", "Nilson Angulo",
      "Alan Minda", "Kevin Rodríguez", "Enner Valencia",
    ],
  },
  {
    code: "NED",
    name: "Países Bajos",
    flag: "🇳🇱",
    confederation: "UEFA",
    players: [
      "Bart Verbruggen", "Virgil van Dijk", "Micky van de Ven", "Jurriën Timber",
      "Denzel Dumfries", "Nathan Aké", "Jeremie Frimpong", "Jan Paul van Hecke",
      "Tijjani Reijnders", "Ryan Gravenberch", "Teun Koopmeiners",
      "Frenkie de Jong", "Xavi Simons", "Justin Kluivert", "Memphis Depay",
      "Donyell Malen", "Wout Weghorst", "Cody Gakpo",
    ],
  },
  {
    code: "JPN",
    name: "Japón",
    flag: "🇯🇵",
    confederation: "AFC",
    players: [
      "Zion Suzuki", "Henry Heroki Mochizuki", "Ayumu Seko", "Junnosuke Suzuki",
      "Shogo Taniguchi", "Tsuyoshi Watanabe", "Kaishu Sano", "Yuki Soma",
      "Ao Tanaka", "Daichi Kamada", "Takefusa Kubo",
      "Ritsu Doan", "Keito Nakamura", "Takumi Minamino", "Shuto Machino",
      "Junya Ito", "Koki Ogawa", "Ayase Ueda",
    ],
  },
  {
    code: "SWE",
    name: "Suecia",
    flag: "🇸🇪",
    confederation: "UEFA",
    players: [
      "Viktor Johansson", "Isak Hien", "Gabriel Gudmundsson", "Emil Holm",
      "Victor Nilsson Lindelöf", "Gustaf Lagerbielke", "Lucas Bergvall", "Hugo Larsson",
      "Jesper Karlström", "Yasin Ayari", "Mattias Svanberg",
      "Daniel Svensson", "Ken Sema", "Roony Bardghji", "Dejan Kulusevski",
      "Anthony Elanga", "Alexander Isak", "Viktor Gyökeres",
    ],
  },
  {
    code: "TUN",
    name: "Túnez",
    flag: "🇹🇳",
    confederation: "CAF",
    players: [
      "Béchir Ben Saïd", "Aymen Dahmen", "Van Valery", "Montassar Talbi",
      "Yassine Meriah", "Ali Abdi", "Dylan Bronn", "Ellyes Skhiri",
      "Aïssa Laïdouni", "Ferjani Sassi", "Mohamed Ali Ben Romdhane",
      "Hannibal Mejbri", "Elias Achouri", "Elias Saad", "Hazem Mastouri",
      "Ismaël Gharbi", "Sayfallah Ltaief", "Naïm Sliti",
    ],
  },
  {
    code: "BEL",
    name: "Bélgica",
    flag: "🇧🇪",
    confederation: "UEFA",
    players: [
      "Thibaut Courtois", "Arthur Theate", "Timothy Castagne", "Zeno Debast",
      "Brandon Mechele", "Maxim De Cuyper", "Thomas Meunier", "Youri Tielemans",
      "Amadou Onana", "Nicolas Raskin", "Alexis Saelemaekers",
      "Hans Vanaken", "Kevin De Bruyne", "Jérémy Doku", "Charles De Ketelaere",
      "Leandro Trossard", "Loïs Openda", "Romelu Lukaku",
    ],
  },
  {
    code: "EGY",
    name: "Egipto",
    flag: "🇪🇬",
    confederation: "CAF",
    players: [
      "Mohamed El-Shenawy", "Mohamed Hany", "Mohamed Hamdy", "Yasser Ibrahim",
      "Khaled Sobhi", "Ramy Rabia", "Hossam Abdelmaguid", "Ahmed Fatouh",
      "Marwan Attia", "Zizo", "Hamdy Fathy",
      "Mohanad Lasheen", "Emam Ashour", "Osama Faisal", "Mohamed Salah",
      "Mostafa Mohamed", "Trézéguet", "Omar Marmoush",
    ],
  },
  {
    code: "IRN",
    name: "Irán",
    flag: "🇮🇷",
    confederation: "AFC",
    players: [
      "Alireza Beiranvand", "Morteza Pouraliganji", "Ehsan Hajsafi", "Milad Mohammadi",
      "Shojae Khalilzadeh", "Ramin Rezaeian", "Hossein Kanaani", "Sadegh Moharrami",
      "Saleh Hardani", "Saeid Ezatolahi", "Saman Ghoddos",
      "Omid Noorafkan", "Roozbeh Cheshmi", "Mohammad Mohebi", "Sardar Azmoun",
      "Mehdi Taremi", "Alireza Jahanbakhsh", "Ali Gholizadeh",
    ],
  },
  {
    code: "NZL",
    name: "Nueva Zelanda",
    flag: "🇳🇿",
    confederation: "OFC",
    players: [
      "Max Crocombe", "Alex Paulsen", "Michael Boxall", "Liberato Cacace",
      "Tim Payne", "Tyler Bindon", "Francis de Vries", "Finn Surman",
      "Joe Bell", "Sarpreet Singh", "Ryan Thomas",
      "Matthew Garbett", "Marko Stamenić", "Ben Old", "Chris Wood",
      "Elijah Just", "Callum McCowatt", "Kosta Barbarouses",
    ],
  },
  {
    code: "ESP",
    name: "España",
    flag: "🇪🇸",
    confederation: "UEFA",
    players: [
      "Unai Simón", "Robin Le Normand", "Aymeric Laporte", "Dean Huijsen",
      "Pedro Porro", "Dani Carvajal", "Marc Cucurella", "Martín Zubimendi",
      "Rodri", "Pedri", "Fabián Ruiz",
      "Mikel Merino", "Lamine Yamal", "Dani Olmo", "Nico Williams",
      "Ferran Torres", "Álvaro Morata", "Mikel Oyarzabal",
    ],
  },
  {
    code: "CPV",
    name: "Cabo Verde",
    flag: "🇨🇻",
    confederation: "CAF",
    players: [
      "Vozinha", "Logan Costa", "Pico", "Dinei",
      "Steven Moreira", "Wagner Pina", "João Paulo", "Yannick Semedo",
      "Kevin Pina", "Patrick Andrade", "Jamiro Monteiro",
      "Deroy Duarte", "Garry Rodrigues", "Jovane Cabral", "Ryan Mendes",
      "Dailon Livramento", "Willy Semedo", "Beb",
    ],
  },
  {
    code: "KSA",
    name: "Arabia Saudita",
    flag: "🇸🇦",
    confederation: "AFC",
    players: [
      "Nawaf Al-Aqidi", "Abdulrahman Al-Sanbi", "Saud Abdulhamid", "Nawaf Boushal",
      "Jehad Thikri", "Moteb Al-Harbi", "Hassan Al-Tambakti", "Musab Al-Juwayr",
      "Ziyad Al-Johani", "Abdullah Al-Khaibari", "Nasser Al-Dawsari",
      "Saleh Abu Al-Shamat", "Marwan Al-Sahafi", "Salem Al-Dawsari", "Abdulrahman Al-Obud",
      "Feras Al-Brikan", "Saleh Al-Shehri", "Abdullah Al-Hamdan",
    ],
  },
  {
    code: "URU",
    name: "Uruguay",
    flag: "🇺🇾",
    confederation: "CONMEBOL",
    players: [
      "Sergio Rochet", "Santiago Mele", "Ronald Araújo", "José María Giménez",
      "Sebastián Cáceres", "Mathías Olivera", "Guillermo Varela", "Nahitan Nández",
      "Federico Valverde", "Giorgian de Arrascaeta", "Rodrigo Bentancur",
      "Manuel Ugarte", "Nicolás de la Cruz", "Maxi Araújo", "Darwin Núñez",
      "Federico Viñas", "Rodrigo Aguirre", "Facundo Pellistri",
    ],
  },
  {
    code: "FRA",
    name: "Francia",
    flag: "🇫🇷",
    confederation: "UEFA",
    players: [
      "Mike Maignan", "Theo Hernández", "William Saliba", "Jules Koundé",
      "Ibrahima Konaté", "Dayot Upamecano", "Lucas Digne", "Aurélien Tchouaméni",
      "Eduardo Camavinga", "Manu Koné", "Adrien Rabiot",
      "Michael Olise", "Ousmane Dembélé", "Bradley Barcola", "Désiré Doué",
      "Kingsley Coman", "Hugo Ekitiké", "Kylian Mbappé",
    ],
  },
  {
    code: "SEN",
    name: "Senegal",
    flag: "🇸🇳",
    confederation: "CAF",
    players: [
      "Édouard Mendy", "Yehvann Diouf", "Moussa Niakhaté", "Abdoulaye Seck",
      "Ismail Jakobs", "El Hadji Malick Diouf", "Kalidou Koulibaly", "Idrissa Gana Gueye",
      "Pape Matar Sarr", "Pape Gueye", "Habib Diarra",
      "Lamine Camara", "Sadio Mané", "Ismaïla Sarr", "Boulaye Dia",
      "Iliman Ndiaye", "Nicolas Jackson", "Krépin Diatta",
    ],
  },
  {
    code: "IRQ",
    name: "Irak",
    flag: "🇮🇶",
    confederation: "AFC",
    players: [
      "Jalal Hassan", "Rebin Sulaka", "Hussein Ali", "Akam Hashem",
      "Merchas Doski", "Zaid Tahseen", "Manaf Younis", "Zidane Iqbal",
      "Amir Al-Ammari", "Ibrahim Bayesh", "Ali Jasim",
      "Youssef Amyn", "Aimar Sher", "Marko Farji", "Osama Rashid",
      "Ali Al-Hamadi", "Aymen Hussein", "Mohanad Ali",
    ],
  },
  {
    code: "NOR",
    name: "Noruega",
    flag: "🇳🇴",
    confederation: "UEFA",
    players: [
      "Ørjan Nyland", "Julian Ryerson", "Leo Østigård", "Kristoffer Vassbakk Ajer",
      "Marcus Holmgren Pedersen", "David Møller Wolfe", "Torbjørn Heggem", "Morten Thorsby",
      "Martin Ødegaard", "Sander Berge", "Andreas Schjelderup",
      "Patrick Berg", "Erling Haaland", "Alexander Sørloth", "Aron Dønnum",
      "Jørgen Strand Larsen", "Antonio Nusa", "Oscar Bobb",
    ],
  },
  {
    code: "ARG",
    name: "Argentina",
    flag: "🇦🇷",
    confederation: "CONMEBOL",
    players: [
      "Emiliano Martínez", "Nahuel Molina", "Cristian Romero", "Nicolás Otamendi",
      "Nicolás Tagliafico", "Leonardo Balerdi", "Enzo Fernández", "Alexis Mac Allister",
      "Rodrigo De Paul", "Exequiel Palacios", "Leandro Paredes",
      "Nico Paz", "Franco Mastantuono", "Nico González", "Lionel Messi",
      "Lautaro Martínez", "Julián Álvarez", "Giuliano Simeone",
    ],
  },
  {
    code: "ALG",
    name: "Argelia",
    flag: "🇩🇿",
    confederation: "CAF",
    players: [
      "Alexis Guendouz", "Ramy Bensebaini", "Youcef Atal", "Rayan Aït-Nouri",
      "Mohamed Amine Tougai", "Aïssa Mandi", "Ismaël Bennacer", "Houssem Aouar",
      "Hicham Boudaoui", "Ramiz Zerrouki", "Nabil Bentaleb",
      "Farès Chaïbi", "Riyad Mahrez", "Saïd Benrahma", "Anis Hadj Moussa",
      "Amine Gouiri", "Baghdad Bounedjah", "Mohammed Amoura",
    ],
  },
  {
    code: "AUT",
    name: "Austria",
    flag: "🇦🇹",
    confederation: "UEFA",
    players: [
      "Alexander Schlager", "Patrick Pentz", "David Alaba", "Kevin Danso",
      "Philipp Lienhart", "Stefan Posch", "Phillipp Mwene", "Alexander Prass",
      "Xaver Schlager", "Marcel Sabitzer", "Konrad Laimer",
      "Florian Grillitsch", "Nicolas Seiwald", "Romano Schmid", "Patrick Wimmer",
      "Christoph Baumgartner", "Michael Gregoritsch", "Marko Arnautović",
    ],
  },
  {
    code: "JOR",
    name: "Jordania",
    flag: "🇯🇴",
    confederation: "AFC",
    players: [
      "Yazeed Abulaila", "Ihsan Haddad", "Mohammad Abu Hashish", "Yazan Al-Arab",
      "Abdullah Nasib", "Saleem Obaid", "Mohammad Abualnadi", "Ibrahim Saadeh",
      "Nizar Al-Rashdan", "Noor Al-Rawabdeh", "Mohannad Abu Taha",
      "Amer Jamous", "Mousa Al-Taamari", "Yazan Al-Naimat", "Mahmoud Al-Mardi",
      "Ali Olwan", "Mohammad Abu Zrayq", "Ibrahim Sabra",
    ],
  },
  {
    code: "POR",
    name: "Portugal",
    flag: "🇵🇹",
    confederation: "UEFA",
    players: [
      "Diogo Costa", "José Sá", "Rúben Dias", "João Cancelo",
      "Diogo Dalot", "Nuno Mendes", "Gonçalo Inácio", "Bernardo Silva",
      "Bruno Fernandes", "Rúben Neves", "Vitinha",
      "João Neves", "Cristiano Ronaldo", "Francisco Trincão", "João Félix",
      "Gonçalo Ramos", "Pedro Neto", "Rafael Leão",
    ],
  },
  {
    code: "COD",
    name: "Rep. Dem. Congo",
    flag: "🇨🇩",
    confederation: "CAF",
    players: [
      "Lionel Mpasi", "Aaron Wan-Bissaka", "Axel Tuanzebe", "Arthur Masuaku",
      "Chancel Mbemba", "Joris Kayembe", "Charles Pickel", "Ngal'ayel Mukau",
      "Edo Kayembe", "Samuel Moutoussamy", "Noah Sadiki",
      "Théo Bongonda", "Meschack Elia", "Yoane Wissa", "Brian Cipenga",
      "Fiston Mayele", "Cédric Bakambu", "Nathanaël Mbuku",
    ],
  },
  {
    code: "UZB",
    name: "Uzbekistán",
    flag: "🇺🇿",
    confederation: "AFC",
    players: [
      "Utkir Yusupov", "Farrukh Sayfiev", "Sherzod Nasrullaev", "Umar Eshmurodov",
      "Husniddin Aliqulov", "Rustam Ashurmatov", "Khojiakbar Alijonov", "Abdukodir Khusanov",
      "Odiljon Hamrobekov", "Otabek Shukurov", "Jamshid Iskanderov",
      "Azizbek Turgunboev", "Khojimat Erkinov", "Eldor Shomurodov", "Oston Urunov",
      "Jaloliddin Masharipov", "Igor Sergeev", "Abbosbek Fayzullaev",
    ],
  },
  {
    code: "COL",
    name: "Colombia",
    flag: "🇨🇴",
    confederation: "CONMEBOL",
    players: [
      "Camilo Vargas", "David Ospina", "Dávinson Sánchez", "Yerry Mina",
      "Daniel Muñoz", "Johan Mojica", "Jhon Lucumí", "Santiago Arias",
      "Jefferson Lerma", "Kevin Castaño", "Richard Ríos",
      "James Rodríguez", "Juan Fernando Quintero", "Jorge Carrascal", "Jhon Arias",
      "Jhon Córdoba", "Luis Suárez", "Luis Díaz",
    ],
  },
  {
    code: "ENG",
    name: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    confederation: "UEFA",
    players: [
      "Jordan Pickford", "John Stones", "Marc Guéhi", "Ezri Konsa",
      "Trent Alexander-Arnold", "Reece James", "Dan Burn", "Jordan Henderson",
      "Declan Rice", "Jude Bellingham", "Cole Palmer",
      "Morgan Rogers", "Anthony Gordon", "Phil Foden", "Bukayo Saka",
      "Harry Kane", "Marcus Rashford", "Ollie Watkins",
    ],
  },
  {
    code: "CRO",
    name: "Croacia",
    flag: "🇭🇷",
    confederation: "UEFA",
    players: [
      "Dominik Livaković", "Duje Ćaleta-Car", "Joško Gvardiol", "Josip Stanišić",
      "Luka Vušković", "Josip Šutalo", "Kristijan Jakić", "Luka Modrić",
      "Mateo Kovačić", "Martin Baturina", "Lovro Majer",
      "Mario Pašalić", "Petar Sučić", "Ivan Perišić", "Marco Pašalić",
      "Ante Budimir", "Andrej Kramarić", "Franjo Ivanović",
    ],
  },
  {
    code: "GHA",
    name: "Ghana",
    flag: "🇬🇭",
    confederation: "CAF",
    players: [
      "Lawrence Ati Zigi", "Tariq Lamptey", "Mohammed Salisu", "Alidu Seidu",
      "Alexander Djiku", "Gideon Mensah", "Caleb Yirenkyi", "Abdul Issahaku Fatawu",
      "Thomas Partey", "Salis Abdul Samed", "Kamaldeen Sulemana",
      "Mohammed Kudus", "Iñaki Williams", "Jordan Ayew", "Andrew Ayew",
      "Joseph Paintsil", "Osman Bukari", "Antoine Semenyo",
    ],
  },
];

async function main() {
  console.log("Cleaning existing data...");
  await prisma.userSticker.deleteMany();
  await prisma.sticker.deleteMany();
  await prisma.section.deleteMany();

  console.log("Seeding database...");

  let stickerNumber = 1;

  // --- PANINI section (1 sticker) ---
  const paniniSection = await prisma.section.create({
    data: {
      code: "PANINI",
      name: "Panini",
      type: SectionType.INTRO,
      order: 0,
    },
  });

  const paniniSticker = await prisma.sticker.create({
    data: {
      number: stickerNumber++,
      code: "00",
      name: "Panini Logo",
      type: StickerType.INTRO,
      isShiny: true,
      sectionId: paniniSection.id,
    },
  });
  await prisma.userSticker.create({
    data: { stickerId: paniniSticker.id, quantity: 0 },
  });

  // --- FIFA World Cup section (8 stickers) ---
  const fwcSection = await prisma.section.create({
    data: {
      code: "FWC",
      name: "FIFA World Cup",
      type: SectionType.INTRO,
      order: 1,
    },
  });

  for (const s of FWC_STICKERS) {
    const sticker = await prisma.sticker.create({
      data: {
        number: stickerNumber++,
        code: s.code,
        name: s.name,
        type: StickerType.INTRO,
        isShiny: true,
        sectionId: fwcSection.id,
      },
    });
    await prisma.userSticker.create({
      data: { stickerId: sticker.id, quantity: 0 },
    });
  }

  // --- Teams (47 teams × 20 stickers) ---
  for (let i = 0; i < TEAMS.length; i++) {
    const team = TEAMS[i];
    const section = await prisma.section.create({
      data: {
        code: team.code,
        name: team.name,
        type: SectionType.TEAM,
        flagEmoji: team.flag,
        confederation: team.confederation,
        order: i + 2,
      },
    });

    const firstGroup = team.players.slice(0, 11);
    const secondGroup = team.players.slice(11);

    let teamPos = 1;

    // 1 — Badge
    const badge = await prisma.sticker.create({
      data: {
        number: stickerNumber++,
        code: `${team.code}-${teamPos++}`,
        name: `Escudo ${team.name}`,
        type: StickerType.BADGE,
        isShiny: true,
        sectionId: section.id,
      },
    });
    await prisma.userSticker.create({
      data: { stickerId: badge.id, quantity: 0 },
    });

    // 2-12 — First 11 players
    for (const playerName of firstGroup) {
      const player = await prisma.sticker.create({
        data: {
          number: stickerNumber++,
          code: `${team.code}-${teamPos++}`,
          name: playerName,
          type: StickerType.PLAYER,
          sectionId: section.id,
        },
      });
      await prisma.userSticker.create({
        data: { stickerId: player.id, quantity: 0 },
      });
    }

    // 13 — Squad photo
    const squad = await prisma.sticker.create({
      data: {
        number: stickerNumber++,
        code: `${team.code}-${teamPos++}`,
        name: `Equipo ${team.name}`,
        type: StickerType.SPECIAL,
        isShiny: true,
        sectionId: section.id,
      },
    });
    await prisma.userSticker.create({
      data: { stickerId: squad.id, quantity: 0 },
    });

    // 14-20 — Last 7 players
    for (const playerName of secondGroup) {
      const player = await prisma.sticker.create({
        data: {
          number: stickerNumber++,
          code: `${team.code}-${teamPos++}`,
          name: playerName,
          type: StickerType.PLAYER,
          sectionId: section.id,
        },
      });
      await prisma.userSticker.create({
        data: { stickerId: player.id, quantity: 0 },
      });
    }
  }

  // --- Coca-Cola section (12 stickers) ---
  const ccSection = await prisma.section.create({
    data: {
      code: "CC",
      name: "Coca-Cola",
      type: SectionType.SPECIAL,
      order: TEAMS.length + 2,
    },
  });

  for (const s of COCA_COLA_STICKERS) {
    const sticker = await prisma.sticker.create({
      data: {
        number: stickerNumber++,
        code: s.code,
        name: s.name,
        type: StickerType.SPECIAL,
        isShiny: true,
        sectionId: ccSection.id,
      },
    });
    await prisma.userSticker.create({
      data: { stickerId: sticker.id, quantity: 0 },
    });
  }

  const totalStickers = stickerNumber - 1;
  console.log(
    `Seeded ${totalStickers} stickers across ${TEAMS.length + 3} sections`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
