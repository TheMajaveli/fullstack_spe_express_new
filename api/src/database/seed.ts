import { db } from "./connection";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

async function seed() {
  try {
    // Categories
    const categoryNames = ["Sci-Fi", "Action", "Drama", "Crime", "Horror", "Romance"];
    const categoryMap = new Map<string, string>();

    for (const name of categoryNames) {
      // Check if category exists first
      const [existing] = await db.execute("SELECT id FROM categories WHERE name = ?", [name]);
      const existingArray = existing as any[];
      
      if (existingArray.length > 0) {
        // Use existing category ID
        categoryMap.set(name, existingArray[0].id);
      } else {
        // Create new category
        const id = randomUUID();
        await db.execute("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name]);
        categoryMap.set(name, id);
      }
    }

    // Admin user
    const adminEmail = "admin@cinenoir.local";
    const adminPassword = "Admin1234";
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const adminId = randomUUID();

    await db.execute(
      "INSERT INTO users (id, email, username, passwordHash, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE role = ?",
      [adminId, adminEmail, "admin", passwordHash, "ADMIN", "ADMIN"]
    );

    console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);

    // Dummy users for testing
    const dummyUsers = [
      { username: "john_doe", email: "john@cinenoir.local" },
      { username: "jane_smith", email: "jane@cinenoir.local" },
      { username: "mike_wilson", email: "mike@cinenoir.local" },
      { username: "sarah_jones", email: "sarah@cinenoir.local" },
      { username: "david_brown", email: "david@cinenoir.local" },
      { username: "emma_davis", email: "emma@cinenoir.local" },
      { username: "chris_miller", email: "chris@cinenoir.local" },
      { username: "lisa_garcia", email: "lisa@cinenoir.local" },
      { username: "tom_martinez", email: "tom@cinenoir.local" },
      { username: "anna_rodriguez", email: "anna@cinenoir.local" },
      { username: "james_hernandez", email: "james@cinenoir.local" },
      { username: "maria_lopez", email: "maria@cinenoir.local" },
      { username: "robert_gonzalez", email: "robert@cinenoir.local" },
      { username: "patricia_wilson", email: "patricia@cinenoir.local" },
      { username: "michael_anderson", email: "michael@cinenoir.local" },
    ];

    const userPassword = "User1234";
    const userPasswordHash = await bcrypt.hash(userPassword, 12);

    for (const user of dummyUsers) {
      const userId = randomUUID();
      await db.execute(
        "INSERT INTO users (id, email, username, passwordHash, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = VALUES(username)",
        [userId, user.email, user.username, userPasswordHash, "USER"]
      );
    }

    console.log(`✅ Created ${dummyUsers.length} dummy users with password: ${userPassword}`);

    // Movies with complete data including real poster URLs
    const movies = [
      {
        title: "Dune",
        year: 2021,
        ratingAvg: 8.0,
        category: "Sci-Fi",
        duration: "2h 35m",
        director: "Denis Villeneuve",
        posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        description: "Paul Atreides leads a rebellion to restore his family's reign over the desert planet Arrakis, the only source of the universe's most valuable substance.",
      },
      {
        title: "Dune: Part Two",
        year: 2024,
        ratingAvg: 8.6,
        category: "Sci-Fi",
        duration: "2h 46m",
        director: "Denis Villeneuve",
        posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      },
      {
        title: "Oppenheimer",
        year: 2023,
        ratingAvg: 8.3,
        category: "Drama",
        duration: "3h 0m",
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
      },
      {
        title: "Spider-Man: No Way Home",
        year: 2021,
        ratingAvg: 8.2,
        category: "Action",
        duration: "2h 28m",
        director: "Jon Watts",
        posterUrl: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
      },
      {
        title: "Top Gun: Maverick",
        year: 2022,
        ratingAvg: 8.2,
        category: "Action",
        duration: "2h 10m",
        director: "Joseph Kosinski",
        posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, training a new generation of pilots for a dangerous mission.",
      },
      {
        title: "Everything Everywhere All at Once",
        year: 2022,
        ratingAvg: 8.1,
        category: "Action",
        duration: "2h 19m",
        director: "Daniel Kwan, Daniel Scheinert",
        posterUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
        description: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led.",
      },
      {
        title: "The Batman",
        year: 2022,
        ratingAvg: 7.8,
        category: "Action",
        duration: "2h 56m",
        director: "Matt Reeves",
        posterUrl: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
      },
      {
        title: "Parasite",
        year: 2019,
        ratingAvg: 8.5,
        category: "Drama",
        duration: "2h 12m",
        director: "Bong Joon Ho",
        posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        description: "Greed and class discrimination threaten the newly formed relationship between the wealthy Park family and the destitute Kim clan.",
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        year: 2023,
        ratingAvg: 8.6,
        category: "Action",
        duration: "2h 20m",
        director: "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson",
        posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEREuyJBOfDGAg0uA8bgzK.jpg",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
      },
      {
        title: "John Wick: Chapter 4",
        year: 2023,
        ratingAvg: 7.7,
        category: "Action",
        duration: "2h 49m",
        director: "Chad Stahelski",
        posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        description: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances.",
      },
      {
        title: "The Whale",
        year: 2022,
        ratingAvg: 7.7,
        category: "Drama",
        duration: "1h 57m",
        director: "Darren Aronofsky",
        posterUrl: "https://image.tmdb.org/t/p/w500/jQ0gylJMxWSL490sy0RrPj1Lj7e.jpg",
        description: "A reclusive English teacher suffering from severe obesity attempts to reconnect with his estranged teenage daughter for one last chance at redemption.",
      },
      {
        title: "Get Out",
        year: 2017,
        ratingAvg: 7.8,
        category: "Horror",
        duration: "1h 44m",
        director: "Jordan Peele",
        posterUrl: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXcSU9bKwPkw.jpg",
        description: "A young African-American visits his white girlfriend's parents for the weekend, where his uneasiness about their reception of him eventually reaches a boiling point.",
      },
      {
        title: "The Dark Knight",
        year: 2008,
        ratingAvg: 9.0,
        category: "Action",
        duration: "2h 32m",
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      },
      {
        title: "Inception",
        year: 2010,
        ratingAvg: 8.8,
        category: "Sci-Fi",
        duration: "2h 28m",
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      },
      {
        title: "Interstellar",
        year: 2014,
        ratingAvg: 8.6,
        category: "Sci-Fi",
        duration: "2h 49m",
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      },
      {
        title: "The Godfather",
        year: 1972,
        ratingAvg: 9.2,
        category: "Crime",
        duration: "2h 55m",
        director: "Francis Ford Coppola",
        posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      },
      {
        title: "Pulp Fiction",
        year: 1994,
        ratingAvg: 8.9,
        category: "Crime",
        duration: "2h 34m",
        director: "Quentin Tarantino",
        posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      },
      {
        title: "The Shawshank Redemption",
        year: 1994,
        ratingAvg: 9.3,
        category: "Drama",
        duration: "2h 22m",
        director: "Frank Darabont",
        posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3d2quS.jpg",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      },
      {
        title: "La La Land",
        year: 2016,
        ratingAvg: 8.0,
        category: "Romance",
        duration: "2h 8m",
        director: "Damien Chazelle",
        posterUrl: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
      },
      {
        title: "Hereditary",
        year: 2018,
        ratingAvg: 7.3,
        category: "Horror",
        duration: "2h 7m",
        director: "Ari Aster",
        posterUrl: "https://image.tmdb.org/t/p/w500/4GFPuL14eXi66fO7e1Kp0Q5X3Of.jpg",
        description: "A grieving family is haunted by tragic and disturbing occurrences after the death of their secretive grandmother.",
      },
      {
        title: "Avatar: The Way of Water",
        year: 2022,
        ratingAvg: 7.6,
        category: "Sci-Fi",
        duration: "3h 12m",
        director: "James Cameron",
        posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.",
      },
      {
        title: "Guardians of the Galaxy Vol. 3",
        year: 2023,
        ratingAvg: 8.0,
        category: "Action",
        duration: "2h 30m",
        director: "James Gunn",
        posterUrl: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
        description: "Peter Quill rallies his team to defend the universe and one of their own - a mission that could mean the end of the Guardians if not successful.",
      },
      {
        title: "The Creator",
        year: 2023,
        ratingAvg: 7.1,
        category: "Sci-Fi",
        duration: "2h 13m",
        director: "Gareth Edwards",
        posterUrl: "https://image.tmdb.org/t/p/w500/vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg",
        description: "Against the backdrop of a war between humans and robots with artificial intelligence, a former soldier finds the secret weapon, a robot in the form of a young child.",
      },
      {
        title: "Killers of the Flower Moon",
        year: 2023,
        ratingAvg: 7.6,
        category: "Crime",
        duration: "3h 26m",
        director: "Martin Scorsese",
        posterUrl: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
        description: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one - until the FBI steps in to unravel the mystery.",
      },
      {
        title: "M3GAN",
        year: 2022,
        ratingAvg: 7.3,
        category: "Horror",
        duration: "1h 42m",
        director: "Gerard Johnstone",
        posterUrl: "https://image.tmdb.org/t/p/w500/xYLBgw7dHyEqmcrSk2Sq3asuSq5.jpg",
        description: "A robotics engineer designs an artificially intelligent doll to be a child's companion. But when the doll becomes too real, it begins to behave in disturbing ways.",
      },
      {
        title: "Smile",
        year: 2022,
        ratingAvg: 6.6,
        category: "Horror",
        duration: "1h 55m",
        director: "Parker Finn",
        posterUrl: "https://image.tmdb.org/t/p/w500/aPqcQwu4VGEewPhagWNncDbJ9Xp.jpg",
        description: "After witnessing a bizarre, traumatic incident involving a patient, Dr. Rose Cotter starts experiencing frightening occurrences that she can't explain.",
      },
      {
        title: "Nope",
        year: 2022,
        ratingAvg: 6.9,
        category: "Horror",
        duration: "2h 10m",
        director: "Jordan Peele",
        posterUrl: "https://image.tmdb.org/t/p/w500/AcKVlWaNVVVFQwro3nLXqPljcYA.jpg",
        description: "Residents in a lonely gulch of inland California witness a mysterious and anomalous event and attempt to capture video evidence.",
      },
      {
        title: "Talk to Me",
        year: 2023,
        ratingAvg: 7.1,
        category: "Horror",
        duration: "1h 35m",
        director: "Danny Philippou, Michael Philippou",
        posterUrl: "https://image.tmdb.org/t/p/w500/kdPMUMJzyYAc4roD52qavX0nLIC.jpg",
        description: "When a group of friends discover how to conjure spirits using an embalmed hand, they become hooked on the new thrill, until one of them goes too far and unleashes terrifying supernatural forces.",
      },
      {
        title: "Tenet",
        year: 2020,
        ratingAvg: 7.3,
        category: "Sci-Fi",
        duration: "2h 30m",
        director: "Christopher Nolan",
        posterUrl: "https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
        description: "Armed with only one word and fighting for the survival of the entire world, the Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time.",
      },
      {
        title: "The Fabelmans",
        year: 2022,
        ratingAvg: 7.6,
        category: "Drama",
        duration: "2h 31m",
        director: "Steven Spielberg",
        posterUrl: "https://image.tmdb.org/t/p/w500/d2IywybrFxKGy7sC4NthcViKGPl.jpg",
        description: "Growing up in post-World War II era Arizona, young Sammy Fabelman aspires to become a filmmaker as he reaches adolescence, but soon discovers a shattering family secret and explores how the power of films can help him see the truth.",
      },
      {
        title: "Past Lives",
        year: 2023,
        ratingAvg: 7.8,
        category: "Romance",
        duration: "1h 46m",
        director: "Celine Song",
        posterUrl: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
        description: "Two childhood friends are separated after one's family emigrates from South Korea. Two decades later, they are reunited for one fateful week as they confront destiny, love and the choices that make a life.",
      },
      {
        title: "Anyone But You",
        year: 2023,
        ratingAvg: 7.0,
        category: "Romance",
        duration: "1h 43m",
        director: "Will Gluck",
        posterUrl: "https://image.tmdb.org/t/p/w500/5qHNlLt5jHfOP8fTzc02NqDMfFb.jpg",
        description: "After an amazing first date, Bea and Ben's fiery attraction turns ice cold - until they find themselves unexpectedly reunited at a destination wedding in Australia. So they do what any two mature adults would do: pretend to be a couple.",
      },
      {
        title: "Mission: Impossible - Dead Reckoning Part One",
        year: 2023,
        ratingAvg: 7.6,
        category: "Action",
        duration: "2h 43m",
        director: "Christopher McQuarrie",
        posterUrl: "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
        description: "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity if it falls into the wrong hands. With control of the future and the fate of the world at stake, a deadly race around the globe begins.",
      },
      {
        title: "Fast X",
        year: 2023,
        ratingAvg: 7.2,
        category: "Action",
        duration: "2h 21m",
        director: "Louis Leterrier",
        posterUrl: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
        description: "Over many missions and against impossible odds, Dom Toretto and his family have outsmarted, out-nerved and outdriven every foe in their path. Now, they confront the most lethal opponent they've ever faced: A terrifying threat emerging from the shadows of the past.",
      },
      {
        title: "Tar",
        year: 2022,
        ratingAvg: 7.3,
        category: "Drama",
        duration: "2h 38m",
        director: "Todd Field",
        posterUrl: "https://image.tmdb.org/t/p/w500/dRVAlaU0vbG6hMf2K45NSiIyoUe.jpg",
        description: "Renowned musician Lydia Tár is days away from recording the symphony that will elevate her career. However, Lydia's elaborate facade begins to unravel, revealing dirty secrets and the corrosive nature of power.",
      },
      {
        title: "Glass Onion: A Knives Out Mystery",
        year: 2022,
        ratingAvg: 7.1,
        category: "Crime",
        duration: "2h 19m",
        director: "Rian Johnson",
        posterUrl: "https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg",
        description: "World-famous detective Benoit Blanc heads to Greece to peel back the layers of a mystery surrounding a tech billionaire and his eclectic crew of friends.",
      },
      {
        title: "Barbie",
        year: 2023,
        ratingAvg: 7.1,
        category: "Romance",
        duration: "1h 54m",
        director: "Greta Gerwig",
        posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
      },
      {
        title: "The Super Mario Bros. Movie",
        year: 2023,
        ratingAvg: 7.7,
        category: "Action",
        duration: "1h 32m",
        director: "Aaron Horvath, Michael Jelenic",
        posterUrl: "https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
        description: "While working underground to fix a water main, Brooklyn plumbers and brothers Mario and Luigi are transported down a mysterious pipe and wander into a magical new world. But when the brothers are separated, Mario embarks on an epic quest to find Luigi.",
      },
      {
        title: "No Time to Die",
        year: 2021,
        ratingAvg: 7.3,
        category: "Action",
        duration: "2h 43m",
        director: "Cary Joji Fukunaga",
        posterUrl: "https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg",
        description: "Bond has left active service and is enjoying a tranquil life in Jamaica. His peace is short-lived when his old friend Felix Leiter from the CIA turns up asking for help. The mission to rescue a kidnapped scientist turns out to be far more treacherous than expected.",
      },
      {
        title: "CODA",
        year: 2021,
        ratingAvg: 8.0,
        category: "Drama",
        duration: "1h 51m",
        director: "Sian Heder",
        posterUrl: "https://image.tmdb.org/t/p/w500/ilKE2RPpviMFF62GFNuehdlR3hX.jpg",
        description: "As a CODA (Child of Deaf Adults), Ruby is the only hearing person in her deaf family. When the family's fishing business is threatened, Ruby finds herself torn between pursuing her love of music and her fear of abandoning her parents.",
      },
      // 60 additional movies (poster uses reliable placeholder to avoid broken images)
      ...([
        "The Matrix", "Blade Runner 2049", "Mad Max: Fury Road", "Black Panther", "Joker", "1917", "Knives Out", "Ford v Ferrari", "Jojo Rabbit", "Once Upon a Time in Hollywood",
        "A Quiet Place", "The Irishman", "Marriage Story", "The Two Popes", "Little Women", "Uncut Gems", "The Lighthouse", "Parasite", "Portrait of a Lady on Fire", "Pain and Glory",
        "Avengers: Endgame", "Toy Story 4", "Aladdin", "The Lion King", "Frozen II", "Jumanji: The Next Level", "Star Wars: The Rise of Skywalker", "Captain Marvel", "Us", "Rocketman",
        "Bohemian Rhapsody", "A Star Is Born", "Green Book", "Roma", "The Favourite", "Vice", "BlackKklansman", "First Man", "If Beale Street Could Talk", "Can You Ever Forgive Me?",
        "Three Billboards Outside Ebbing Missouri", "Lady Bird", "Get Out", "Dunkirk", "The Shape of Water", "Call Me by Your Name", "The Post", "Phantom Thread", "Darkest Hour", "Mudbound",
        "La La Land", "Moonlight", "Manchester by the Sea", "Arrival", "Hell or High Water", "Lion", "Hidden Figures", "Fences", "Hacksaw Ridge", "Loving",
        "Spotlight", "The Revenant", "The Big Short", "Bridge of Spies", "Brooklyn", "Room", "Mad Max: Fury Road", "The Martian", "Sicario", "Ex Machina",
      ] as const).map((title, idx) => {
        const year = 2015 + (idx % 10);
        const categories = ["Sci-Fi", "Action", "Drama", "Crime", "Horror", "Romance"] as const;
        const category = categories[idx % categories.length];
        return {
          title,
          year,
          ratingAvg: 7 + (idx % 30) / 10,
          category,
          duration: "2h 0m",
          director: "Various",
          posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=500",
          description: `${title} – a compelling story.`,
        };
      }),
    ];

    for (const m of movies) {
      const movieId = randomUUID();
      const releaseDate = new Date(`${m.year}-01-01T00:00:00.000Z`);

      // Check if movie exists
      const [existing] = await db.execute("SELECT id FROM movies WHERE title = ?", [m.title]);
      const existingArray = existing as any[];

      if (existingArray.length > 0) {
        // Update existing
        console.log(`Updating movie: ${m.title}`);
        await db.execute(
          "UPDATE movies SET description = ?, year = ?, releaseDate = ?, duration = ?, director = ?, ratingAvg = ?, posterUrl = ? WHERE id = ?",
          [
            m.description,
            m.year,
            releaseDate,
            m.duration,
            m.director,
            m.ratingAvg,
            m.posterUrl,
            existingArray[0].id,
          ]
        );
        const catId = categoryMap.get(m.category);
        if (catId) {
          await db.execute(
            "INSERT IGNORE INTO movie_categories (movieId, categoryId) VALUES (?, ?)",
            [existingArray[0].id, catId]
          );
        }
      } else {
        // Create new
        console.log(`Creating movie: ${m.title}`);
        await db.execute(
          "INSERT INTO movies (id, title, description, releaseDate, year, duration, director, ratingAvg, posterUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [movieId, m.title, m.description, releaseDate, m.year, m.duration, m.director, m.ratingAvg, m.posterUrl]
        );

        const catId = categoryMap.get(m.category);
        if (catId) {
          await db.execute("INSERT INTO movie_categories (movieId, categoryId) VALUES (?, ?)", [movieId, catId]);
        }
      }
    }

    console.log(`✅ Database seeded successfully with ${movies.length} movies`);
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await db.end();
    process.exit(1);
  }
}

seed();
