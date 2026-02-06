import { db } from "./connection";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

async function seed() {
  try {
    // Categories
    const categoryNames = ["Sci-Fi", "Action", "Drama", "Crime", "Horror", "Romance"];
    const categoryMap = new Map<string, string>();

    for (const name of categoryNames) {
      const id = randomUUID();
      await db.execute("INSERT IGNORE INTO categories (id, name) VALUES (?, ?)", [id, name]);
      categoryMap.set(name, id);
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
    ];

    for (const m of movies) {
      const movieId = randomUUID();
      const releaseDate = new Date(`${m.year}-01-01T00:00:00.000Z`);

      // Check if movie exists
      const [existing] = await db.execute("SELECT id FROM movies WHERE title = ?", [m.title]);
      const existingArray = existing as any[];

      if (existingArray.length > 0) {
        // Update existing
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
