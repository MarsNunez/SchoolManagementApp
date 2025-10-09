import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { StaffModel } from "../models/Staff.js";
import { TeacherModel } from "../models/Teacher.js";
import { CourseModel } from "../models/Course.js";
import { SyllabusModel } from "../models/Syllabus.js";
import { ParentModel } from "../models/Parent.js";
import { StudentModel } from "../models/Student.js";
import { SectionModel } from "../models/Section.js";
import { PostModel } from "../models/Post.js";

dotenv.config();

const seed = async () => {
  try {
    if (!process.env.DB_URL) {
      throw new Error("DB_URL is not defined in the environment variables");
    }

    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    await Promise.all([
      StaffModel.deleteMany({}),
      TeacherModel.deleteMany({}),
      CourseModel.deleteMany({}),
      SyllabusModel.deleteMany({}),
      ParentModel.deleteMany({}),
      StudentModel.deleteMany({}),
      SectionModel.deleteMany({}),
      PostModel.deleteMany({}),
    ]);

    const staffRaw = [
      {
        staff_id: "staff-001",
        name: "Lucia",
        lastname: "Ramirez",
        dni: 70234561,
        email: "lucia.ramirez@colegio.edu",
        password: "StaffAdmin#1",
        role: "admin",
        state: true,
      },
      {
        staff_id: "staff-002",
        name: "Diego",
        lastname: "Salazar",
        dni: 70234562,
        email: "diego.salazar@colegio.edu",
        password: "StaffAdmin#1",
        role: "admin",
        state: true,
      },
      {
        staff_id: "staff-003",
        name: "Rosa",
        lastname: "Valdes",
        dni: 71234563,
        email: "rosa.valdes@colegio.edu",
        password: "Secretaria#1",
        role: "secretary",
        state: true,
      },
      {
        staff_id: "staff-004",
        name: "Maria",
        lastname: "Huaman",
        dni: 71234564,
        email: "maria.huaman@colegio.edu",
        password: "Secretaria#1",
        role: "secretary",
        state: true,
      },
      {
        staff_id: "staff-005",
        name: "Karen",
        lastname: "Lagos",
        dni: 71234565,
        email: "karen.lagos@colegio.edu",
        password: "Secretaria#1",
        role: "secretary",
        state: true,
      },
    ];

    const staffSeed = await Promise.all(
      staffRaw.map(async (member) => ({
        ...member,
        password: await bcrypt.hash(member.password, 10),
      }))
    );

    await StaffModel.insertMany(staffSeed);
    console.log(`Inserted ${staffSeed.length} staff members`);

    const teacherSeed = [
      {
        teacher_id: "teacher-001",
        name: "Rafael",
        lastname: "Mendoza",
        dni: 76230011,
        specialties: ["Matematica", "Fisica"],
        email: "rafael.mendoza@colegio.edu",
        phone: "+51987654321",
        current_teaching_courses: ["course-math-01", "course-physics-01"],
      },
      {
        teacher_id: "teacher-002",
        name: "Carolina",
        lastname: "Paredes",
        dni: 76230012,
        specialties: ["Historia", "Civica"],
        email: "carolina.paredes@colegio.edu",
        phone: "+51987654322",
        current_teaching_courses: ["course-history-01", "course-literature-01"],
      },
      {
        teacher_id: "teacher-003",
        name: "German",
        lastname: "Silva",
        dni: 76230013,
        specialties: ["Biologia", "Quimica"],
        email: "german.silva@colegio.edu",
        phone: "+51987654323",
        current_teaching_courses: ["course-biology-01", "course-chemistry-01"],
      },
    ];

    await TeacherModel.insertMany(teacherSeed);
    console.log(`Inserted ${teacherSeed.length} teachers`);

    const courseSeed = [
      {
        course_id: "course-math-01",
        title: "Matematica I",
        description: "Fundamentos de algebra y geometria.",
        teacher_id: "teacher-001",
        duration: 60,
      },
      {
        course_id: "course-physics-01",
        title: "Fisica I",
        description: "Movimiento, fuerza y energia.",
        teacher_id: "teacher-001",
        duration: 48,
      },
      {
        course_id: "course-history-01",
        title: "Historia del Peru",
        description: "Repaso cronologico desde las culturas preincas hasta la republica.",
        teacher_id: "teacher-002",
        duration: 56,
      },
      {
        course_id: "course-literature-01",
        title: "Literatura Hispanoamericana",
        description: "Autores clasicos y contemporaneos.",
        teacher_id: "teacher-002",
        duration: 50,
      },
      {
        course_id: "course-biology-01",
        title: "Biologia General",
        description: "Estructura celular y sistemas del cuerpo humano.",
        teacher_id: "teacher-003",
        duration: 52,
      },
      {
        course_id: "course-chemistry-01",
        title: "Quimica I",
        description: "Quimica organica basica y reacciones.",
        teacher_id: "teacher-003",
        duration: 52,
      },
      {
        course_id: "course-english-01",
        title: "Ingles Comunicativo",
        description: "Comprension y produccion oral.",
        teacher_id: "teacher-002",
        duration: 45,
      },
      {
        course_id: "course-art-01",
        title: "Arte y Creatividad",
        description: "Exploracion de tecnicas artisticas mixtas.",
        teacher_id: "teacher-002",
        duration: 40,
      },
      {
        course_id: "course-tech-01",
        title: "Tecnologia y Robotica",
        description: "Fundamentos de programacion y robotica educativa.",
        teacher_id: "teacher-001",
        duration: 60,
      },
      {
        course_id: "course-ethics-01",
        title: "Etica y Ciudadania",
        description: "Formacion en valores y convivencia escolar.",
        teacher_id: "teacher-002",
        duration: 38,
      },
    ];

    await CourseModel.insertMany(courseSeed);
    console.log(`Inserted ${courseSeed.length} courses`);

    const syllabusSeed = [
      {
        syllabus_id: "syllabus-2025-secundaria",
        description: "Plan academico para secundaria 2025.",
        year: 2025,
        courses: [
          "course-math-01",
          "course-physics-01",
          "course-biology-01",
          "course-chemistry-01",
          "course-english-01",
        ],
      },
      {
        syllabus_id: "syllabus-2025-bachillerato",
        description: "Plan de estudios bachillerato 2025.",
        year: 2025,
        courses: [
          "course-history-01",
          "course-literature-01",
          "course-art-01",
          "course-tech-01",
          "course-ethics-01",
        ],
      },
    ];

    await SyllabusModel.insertMany(syllabusSeed);
    console.log(`Inserted ${syllabusSeed.length} syllabuses`);

    const parentSeed = [
      {
        parent_id: "parent-001",
        name: "Ana",
        lastname: "Torres",
        dni: 45678901,
        email: "ana.torres@familias.edu",
        phone: 5198765401,
        address: "Av. Primavera 123",
        registered_children: ["student-001", "student-002"],
      },
      {
        parent_id: "parent-002",
        name: "Jorge",
        lastname: "Campos",
        dni: 45678902,
        email: "jorge.campos@familias.edu",
        phone: 5198765402,
        address: "Jr. Los Geranios 456",
        registered_children: ["student-003", "student-004"],
      },
      {
        parent_id: "parent-003",
        name: "Laura",
        lastname: "Delgado",
        dni: 45678903,
        email: "laura.delgado@familias.edu",
        phone: 5198765403,
        address: "Calle Los Cerezos 789",
        registered_children: ["student-005", "student-006"],
      },
      {
        parent_id: "parent-004",
        name: "Carlos",
        lastname: "Ibanez",
        dni: 45678904,
        email: "carlos.ibanez@familias.edu",
        phone: 5198765404,
        address: "Pasaje Las Flores 321",
        registered_children: ["student-007", "student-008"],
      },
    ];

    await ParentModel.insertMany(parentSeed);
    console.log(`Inserted ${parentSeed.length} parents`);

    const studentSeed = [
      {
        student_id: "student-001",
        parents_id: ["parent-001"],
        name: "Mateo",
        lastname: "Torres",
        dni: 30123451,
        birth_date: new Date("2010-03-15"),
        email: "mateo.torres@alumnos.edu",
        phone: "+51911111111",
        address: "Av. Primavera 123",
        current_courses: ["course-math-01", "course-english-01"],
      },
      {
        student_id: "student-002",
        parents_id: ["parent-001"],
        name: "Valeria",
        lastname: "Torres",
        dni: 30123452,
        birth_date: new Date("2011-07-22"),
        email: "valeria.torres@alumnos.edu",
        phone: "+51911111112",
        address: "Av. Primavera 123",
        current_courses: ["course-math-01", "course-art-01"],
      },
      {
        student_id: "student-003",
        parents_id: ["parent-002"],
        name: "Santiago",
        lastname: "Campos",
        dni: 30123453,
        birth_date: new Date("2010-01-30"),
        email: "santiago.campos@alumnos.edu",
        phone: "+51911111113",
        address: "Jr. Los Geranios 456",
        current_courses: ["course-physics-01", "course-tech-01"],
      },
      {
        student_id: "student-004",
        parents_id: ["parent-002"],
        name: "Luciana",
        lastname: "Campos",
        dni: 30123454,
        birth_date: new Date("2011-11-02"),
        email: "luciana.campos@alumnos.edu",
        phone: "+51911111114",
        address: "Jr. Los Geranios 456",
        current_courses: ["course-literature-01", "course-ethics-01"],
      },
      {
        student_id: "student-005",
        parents_id: ["parent-003"],
        name: "Gabriel",
        lastname: "Delgado",
        dni: 30123455,
        birth_date: new Date("2010-05-19"),
        email: "gabriel.delgado@alumnos.edu",
        phone: "+51911111115",
        address: "Calle Los Cerezos 789",
        current_courses: ["course-biology-01", "course-chemistry-01"],
      },
      {
        student_id: "student-006",
        parents_id: ["parent-003"],
        name: "Isabella",
        lastname: "Delgado",
        dni: 30123456,
        birth_date: new Date("2011-09-04"),
        email: "isabella.delgado@alumnos.edu",
        phone: "+51911111116",
        address: "Calle Los Cerezos 789",
        current_courses: ["course-art-01", "course-english-01"],
      },
      {
        student_id: "student-007",
        parents_id: ["parent-004"],
        name: "Andres",
        lastname: "Ibanez",
        dni: 30123457,
        birth_date: new Date("2010-08-10"),
        email: "andres.ibanez@alumnos.edu",
        phone: "+51911111117",
        address: "Pasaje Las Flores 321",
        current_courses: ["course-tech-01", "course-physics-01"],
      },
      {
        student_id: "student-008",
        parents_id: ["parent-004"],
        name: "Renata",
        lastname: "Ibanez",
        dni: 30123458,
        birth_date: new Date("2011-12-18"),
        email: "renata.ibanez@alumnos.edu",
        phone: "+51911111118",
        address: "Pasaje Las Flores 321",
        current_courses: ["course-history-01", "course-literature-01"],
      },
    ];

    await StudentModel.insertMany(studentSeed);
    console.log(`Inserted ${studentSeed.length} students`);

    const sectionSeed = [
      {
        section_id: "section-2025-a",
        title: "Seccion 5A",
        syllabus_id: "syllabus-2025-secundaria",
        teacher_id: "teacher-001",
        year: 2025,
        max_capacity: 30,
        current_capacity: 6,
      },
      {
        section_id: "section-2025-b",
        title: "Seccion 5B",
        syllabus_id: "syllabus-2025-bachillerato",
        teacher_id: "teacher-002",
        year: 2025,
        max_capacity: 30,
        current_capacity: 6,
      },
      {
        section_id: "section-2025-c",
        title: "Seccion 4A",
        syllabus_id: "syllabus-2025-secundaria",
        teacher_id: "teacher-003",
        year: 2025,
        max_capacity: 28,
        current_capacity: 4,
      },
    ];

    await SectionModel.insertMany(sectionSeed);
    console.log(`Inserted ${sectionSeed.length} sections`);

    const postSeed = [
      {
        title: "Inicio de ano escolar",
        content: "Bienvenidos al ano academico 2025. Revisen los horarios adjuntos.",
        links: [
          "https://colegio.edu/horarios-2025.pdf",
          "https://colegio.edu/reglamento.pdf",
        ],
        creator_id: "teacher-001",
      },
      {
        title: "Reunion de padres",
        content: "Se convoca a reunion informativa el proximo viernes a las 7 pm.",
        links: ["https://colegio.edu/agenda-reunion"],
        creator_id: "teacher-002",
      },
      {
        title: "Proyecto de laboratorio",
        content: "Los alumnos de ciencias presentaran sus proyectos finales la proxima semana.",
        links: ["https://colegio.edu/proyectos-ciencias"],
        creator_id: "teacher-003",
      },
    ];

    await PostModel.insertMany(postSeed);
    console.log(`Inserted ${postSeed.length} posts`);

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
};

seed();
