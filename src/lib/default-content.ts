import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  siteTitle: "Guillermo Lopez Guitar",
  subtitle: "Jazz language. Blues-rock fire. Conservatory-level clarity.",
  heroText:
    "A premium guitar studio and performance identity for players, venues, and productions that want musical depth with electric-stage presence.",
  primaryCta: "Book a performance",
  secondaryCta: "Explore lessons",
  bioTitle: "A guitarist shaped by formal study and live instinct",
  bioText:
    "Guillermo blends formal music education with the vocabulary of jazz, the grit of blues rock, and the flexibility demanded by modern stages. His work moves easily between refined private instruction, improvisation coaching, session-ready guitar parts, and expressive live performance.",
  credentials: [
    "Formal music education with harmony, ear training, arranging, and ensemble practice",
    "Jazz, blues, rock, Latin, pop, worship, and acoustic performance fluency",
    "Lesson plans for serious beginners, intermediate improvisers, and advanced players"
  ],
  servicesIntro:
    "Designed for students, artists, venues, and creative teams that need more than generic guitar.",
  services: [
    {
      eyebrow: "Private Study",
      title: "Guitar Lessons",
      description:
        "Structured lessons in technique, harmony, improvisation, repertoire, reading, rhythm, tone, and musical identity."
    },
    {
      eyebrow: "Stage",
      title: "Live Performance",
      description:
        "Elegant solo guitar, jazz trio energy, blues-rock sets, cocktail hours, private events, and venue programming."
    },
    {
      eyebrow: "Studio",
      title: "Session Guitar",
      description:
        "Tasteful guitar parts, lead lines, rhythm textures, arranging support, and production-minded recording."
    }
  ],
  lessonIntro:
    "A music-school inspired path with the warmth of a mentor and the precision of a working guitarist.",
  lessonPackages: [
    {
      title: "Foundations",
      price: "$120",
      cadence: "4 lessons / month",
      description:
        "For newer players who want clean technique, real songs, rhythm security, and a confident practice system.",
      features: ["Technique map", "Repertoire plan", "Practice dashboard"]
    },
    {
      title: "Improviser",
      price: "$180",
      cadence: "4 lessons / month",
      description:
        "For guitarists ready to hear changes, build lines, comp with style, and understand jazz/blues harmony.",
      features: ["Chord-scale fluency", "Transcription work", "Weekly etudes"]
    },
    {
      title: "Artist Intensive",
      price: "$320",
      cadence: "8 sessions / month",
      description:
        "For performers preparing auditions, recordings, live sets, or a serious leap in musicianship.",
      features: ["Performance coaching", "Arrangement support", "Direct feedback"]
    }
  ],
  bookingInfo:
    "Lessons are available online and in person by request. Performance bookings are quoted by event scope, ensemble size, location, and production needs.",
  videoTitle: "Hear the touch before the first note is booked.",
  videoText:
    "A focused performance window: tone, phrasing, time feel, and the kind of musical presence that translates from intimate rooms to full productions.",
  videoUrl: "https://www.youtube.com/watch?v=AZGrF-8FmM4",
  galleryIntro:
    "A visual language of late-night stages, boutique education, polished sessions, and amplifier glow.",
  gallery: [
    {
      title: "Blue Note Vocabulary",
      description: "Modern jazz phrasing, comping, and melodic development.",
      image: "/gallery/jazz-stage.svg"
    },
    {
      title: "Blues-Rock Voltage",
      description: "Expressive leads, dynamic touch, and band-ready tone.",
      image: "/gallery/blues-amp.svg"
    },
    {
      title: "Private Studio",
      description: "Focused lessons built around the student's musical voice.",
      image: "/gallery/lesson-room.svg"
    }
  ],
  testimonials: [
    {
      quote:
        "The lessons finally connected theory to the guitar neck. I stopped memorizing shapes and started hearing music.",
      name: "Mariana R.",
      role: "Jazz guitar student"
    },
    {
      quote:
        "Guillermo brought exactly the right blend of elegance and edge to our event. Professional, tasteful, and alive.",
      name: "Daniel C.",
      role: "Private event client"
    },
    {
      quote:
        "His feedback is precise without killing the joy. Every session gives me something musical I can use immediately.",
      name: "Alex M.",
      role: "Blues-rock guitarist"
    }
  ],
  contactTitle: "Ready to make the guitar feel less ordinary?",
  contactText:
    "Send a note for lessons, performance bookings, recording work, or a custom plan for your musical goals.",
  contactEmail: "booking@guillermolopezguitar.com",
  theme: {
    accent: "#d9a441",
    accentAlt: "#46b7a9",
    background: "#120f0d",
    backgroundImage: "",
    contrast: "balanced",
    light: {
      accent: "#c9862f",
      accentAlt: "#4f9f94",
      background: "#f3ead7",
      backgroundImage: "",
      contrast: "editorial"
    }
  },
  seo: {
    title: "Guillermo Lopez Guitar | Lessons, Jazz, Blues & Live Performance",
    description:
      "Professional guitarist offering premium guitar lessons, jazz and blues-rock performance, session work, and musician coaching.",
    ogImage: "/opengraph-image"
  },
  socialLinks: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    spotify: "https://spotify.com/"
  },
  locales: {
    es: {
      siteTitle: "Guillermo Lopez Guitarra",
      subtitle: "Lenguaje jazz. Fuego blues-rock. Claridad de formación musical.",
      heroText:
        "Un estudio de guitarra y propuesta de performance premium para estudiantes, venues y producciones que buscan profundidad musical con presencia eléctrica.",
      primaryCta: "Reservar presentación",
      secondaryCta: "Ver clases",
      bioTitle: "Un guitarrista formado entre estudio formal e instinto en vivo",
      bioText:
        "Guillermo combina educación musical formal con el vocabulario del jazz, la energía del blues rock y la versatilidad que exigen los escenarios modernos. Su trabajo se mueve con naturalidad entre enseñanza privada, coaching de improvisación, guitarras para sesión y performance expresiva.",
      credentials: [
        "Formación musical formal en armonía, entrenamiento auditivo, arreglos y ensamble",
        "Fluidez en jazz, blues, rock, latín, pop, worship y guitarra acústica",
        "Planes de clase para principiantes serios, improvisadores intermedios y músicos avanzados"
      ],
      servicesIntro:
        "Diseñado para estudiantes, artistas, venues y equipos creativos que necesitan más que guitarra genérica.",
      services: [
        {
          eyebrow: "Estudio privado",
          title: "Clases de guitarra",
          description:
            "Clases estructuradas de técnica, armonía, improvisación, repertorio, lectura, ritmo, sonido e identidad musical."
        },
        {
          eyebrow: "Escenario",
          title: "Música en vivo",
          description:
            "Guitarra solista elegante, energía de trío jazz, sets blues-rock, cocteles, eventos privados y programación para venues."
        },
        {
          eyebrow: "Estudio",
          title: "Guitarra de sesión",
          description:
            "Partes de guitarra con criterio, líneas lead, texturas rítmicas, apoyo de arreglo y grabación con mentalidad de producción."
        }
      ],
      lessonIntro:
        "Un camino inspirado en escuela de música, con calidez de mentor y precisión de guitarrista activo.",
      lessonPackages: [
        {
          title: "Fundamentos",
          price: "$120",
          cadence: "4 clases / mes",
          description:
            "Para nuevos guitarristas que quieren técnica limpia, canciones reales, seguridad rítmica y un sistema de práctica claro.",
          features: ["Mapa técnico", "Plan de repertorio", "Rutina de práctica"]
        },
        {
          title: "Improvisador",
          price: "$180",
          cadence: "4 clases / mes",
          description:
            "Para guitarristas listos para escuchar cambios, construir líneas, acompañar con estilo y entender armonía jazz/blues.",
          features: ["Fluidez acorde-escala", "Trabajo de transcripción", "Etudes semanales"]
        },
        {
          title: "Intensivo artístico",
          price: "$320",
          cadence: "8 sesiones / mes",
          description:
            "Para músicos preparando audiciones, grabaciones, sets en vivo o un salto serio en musicalidad.",
          features: ["Coaching escénico", "Apoyo de arreglos", "Feedback directo"]
        }
      ],
      bookingInfo:
        "Las clases están disponibles online y presencial bajo solicitud. Las presentaciones se cotizan según alcance del evento, ensamble, ubicación y necesidades de producción.",
      videoTitle: "Escucha el toque antes de reservar la primera nota.",
      videoText:
        "Una ventana sobria de performance: sonido, fraseo, pulso y la presencia musical que funciona tanto en espacios íntimos como en producciones completas.",
      videoUrl: "https://www.youtube.com/watch?v=AZGrF-8FmM4",
      galleryIntro:
        "Un lenguaje visual de escenarios nocturnos, educación boutique, sesiones pulidas y brillo de amplificador.",
      gallery: [
        {
          title: "Vocabulario Blue Note",
          description: "Fraseo jazz moderno, acompañamiento y desarrollo melódico.",
          image: "/gallery/jazz-stage.svg"
        },
        {
          title: "Voltaje blues-rock",
          description: "Leads expresivos, toque dinámico y tono listo para banda.",
          image: "/gallery/blues-amp.svg"
        },
        {
          title: "Estudio privado",
          description: "Clases enfocadas alrededor de la voz musical del estudiante.",
          image: "/gallery/lesson-room.svg"
        }
      ],
      testimonials: [
        {
          quote:
            "Las clases conectaron por fin la teoría con el mástil. Dejé de memorizar formas y empecé a escuchar música.",
          name: "Mariana R.",
          role: "Estudiante de guitarra jazz"
        },
        {
          quote:
            "Guillermo trajo exactamente la mezcla de elegancia y filo que necesitaba nuestro evento. Profesional, musical y vivo.",
          name: "Daniel C.",
          role: "Cliente de evento privado"
        },
        {
          quote:
            "Su feedback es preciso sin matar la alegría. Cada sesión me deja algo musical que puedo usar de inmediato.",
          name: "Alex M.",
          role: "Guitarrista blues-rock"
        }
      ],
      contactTitle: "Listo para que la guitarra se sienta menos ordinaria?",
      contactText:
        "Escribe para clases, presentaciones, trabajo de grabación o un plan personalizado para tus metas musicales.",
      contactEmail: "booking@guillermolopezguitar.com"
    }
  }
};
