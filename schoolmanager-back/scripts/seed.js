import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { StaffModel } from "../models/Staff.js";
import { TeacherModel } from "../models/Teacher.js";
import { CourseModel } from "../models/Course.js";
import { StudyPlanModel } from "../models/StudyPlan.js";
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
      StudyPlanModel.deleteMany({}),
      StudentModel.deleteMany({}),
      SectionModel.deleteMany({}),
      PostModel.deleteMany({}),
    ]);

    const staffRaw = [
      {
        staff_id: "staff-001",
        name: "Lucia",
        lastname: "Ramirezz",
        dni: 70234561,
        email: "1@1.com",
        password: "1",
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
        password: "Secretaria#2",
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
        description:
          "Repaso cronologico desde las culturas preincas hasta la republica.",
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

    const studyPlanSeed = [
      {
        studyPlan_id: "studyplan-2025-secundaria-g5",
        level: "secundaria",
        version: 1,
        effectiveFrom: new Date("2025-03-01"),
        state: "active",
        grade: 5,
        minGrade: 12,
        courses: [
          "course-math-01",
          "course-physics-01",
          "course-biology-01",
          "course-chemistry-01",
          "course-english-01",
        ],
      },
      {
        studyPlan_id: "studyplan-2025-secundaria-g4",
        level: "secundaria",
        version: 1,
        effectiveFrom: new Date("2025-03-01"),
        state: "active",
        grade: 4,
        minGrade: 12,
        courses: [
          "course-history-01",
          "course-literature-01",
          "course-art-01",
          "course-tech-01",
          "course-ethics-01",
        ],
      },
    ];

    await StudyPlanModel.insertMany(studyPlanSeed);
    console.log(`Inserted ${studyPlanSeed.length} study plans`);

    const studentSeed = [
      {
        student_id: "student-001",
        guardians: [
          {
            full_name: "Ana Torres",
            phone: "5198765401",
            email: "ana.torres@familias.edu",
          },
        ],
        name: "Mateo",
        lastname: "Torres",
        dni: 30123451,
        birth_date: new Date("2010-03-15"),
        email: "mateo.torres@alumnos.edu",
        phone: "+51911111111",
        address: "Av. Primavera 123",
        section_id: "section-2025-a",
      },
      {
        student_id: "student-002",
        guardians: [
          {
            full_name: "Ana Torres",
            phone: "5198765401",
            email: "ana.torres@familias.edu",
          },
        ],
        name: "Valeria",
        lastname: "Torres",
        dni: 30123452,
        birth_date: new Date("2011-07-22"),
        email: "valeria.torres@alumnos.edu",
        phone: "+51911111112",
        address: "Av. Primavera 123",
        section_id: "section-2025-a",
      },
      {
        student_id: "student-003",
        guardians: [
          {
            full_name: "Jorge Campos",
            phone: "5198765402",
            email: "jorge.campos@familias.edu",
          },
        ],
        name: "Santiago",
        lastname: "Campos",
        dni: 30123453,
        birth_date: new Date("2010-01-30"),
        email: "santiago.campos@alumnos.edu",
        phone: "+51911111113",
        address: "Jr. Los Geranios 456",
        section_id: "section-2025-a",
      },
      {
        student_id: "student-004",
        guardians: [
          {
            full_name: "Jorge Campos",
            phone: "5198765402",
            email: "jorge.campos@familias.edu",
          },
        ],
        name: "Luciana",
        lastname: "Campos",
        dni: 30123454,
        birth_date: new Date("2011-11-02"),
        email: "luciana.campos@alumnos.edu",
        phone: "+51911111114",
        address: "Jr. Los Geranios 456",
        section_id: "section-2025-b",
      },
      {
        student_id: "student-005",
        guardians: [
          {
            full_name: "Laura Delgado",
            phone: "5198765403",
            email: "laura.delgado@familias.edu",
          },
        ],
        name: "Gabriel",
        lastname: "Delgado",
        dni: 30123455,
        birth_date: new Date("2010-05-19"),
        email: "gabriel.delgado@alumnos.edu",
        phone: "+51911111115",
        address: "Calle Los Cerezos 789",
        section_id: "section-2025-b",
      },
      {
        student_id: "student-006",
        guardians: [
          {
            full_name: "Laura Delgado",
            phone: "5198765403",
            email: "laura.delgado@familias.edu",
          },
        ],
        name: "Isabella",
        lastname: "Delgado",
        dni: 30123456,
        birth_date: new Date("2011-09-04"),
        email: "isabella.delgado@alumnos.edu",
        phone: "+51911111116",
        address: "Calle Los Cerezos 789",
        section_id: "section-2025-b",
      },
      {
        student_id: "student-007",
        guardians: [
          {
            full_name: "Carlos Ibanez",
            phone: "5198765404",
            email: "carlos.ibanez@familias.edu",
          },
        ],
        name: "Andres",
        lastname: "Ibanez",
        dni: 30123457,
        birth_date: new Date("2010-08-10"),
        email: "andres.ibanez@alumnos.edu",
        phone: "+51911111117",
        address: "Pasaje Las Flores 321",
        section_id: "section-2025-c",
      },
      {
        student_id: "student-008",
        guardians: [
          {
            full_name: "Carlos Ibanez",
            phone: "5198765404",
            email: "carlos.ibanez@familias.edu",
          },
        ],
        name: "Renata",
        lastname: "Ibanez",
        dni: 30123458,
        birth_date: new Date("2011-12-18"),
        email: "renata.ibanez@alumnos.edu",
        phone: "+51911111118",
        address: "Pasaje Las Flores 321",
        section_id: "section-2025-c",
      },
    ];

    await StudentModel.insertMany(studentSeed);
    console.log(`Inserted ${studentSeed.length} students`);

    const sectionSeed = [
      {
        section_id: "section-2025-a",
        title: "Seccion 5A",
        studyPlan_id: "studyplan-2025-secundaria-g5",
        group: "A",
        teacher_id: "teacher-001",
        year: 2025,
        max_capacity: 30,
        current_capacity: 3,
      },
      {
        section_id: "section-2025-b",
        title: "Seccion 5B",
        studyPlan_id: "studyplan-2025-secundaria-g5",
        group: "B",
        teacher_id: "teacher-002",
        year: 2025,
        max_capacity: 30,
        current_capacity: 3,
      },
      {
        section_id: "section-2025-c",
        title: "Seccion 4A",
        studyPlan_id: "studyplan-2025-secundaria-g4",
        group: "C",
        teacher_id: "teacher-003",
        year: 2025,
        max_capacity: 28,
        current_capacity: 2,
      },
    ];

    await SectionModel.insertMany(sectionSeed);
    console.log(`Inserted ${sectionSeed.length} sections`);

    const postSeed = [
      {
        title: "Inicio de ano escolar",
        content:
          "Bienvenidos al ano academico 2025. Revisen los horarios adjuntos.",
        links: [
          "https://colegio.edu/horarios-2025.pdf",
          "https://colegio.edu/reglamento.pdf",
        ],
        creator_id: "teacher-001",
      },
      {
        title: "Reunion de padres",
        content:
          "Se convoca a reunion informativa el proximo viernes a las 7 pm.",
        links: ["https://colegio.edu/agenda-reunion"],
        creator_id: "teacher-002",
      },
      {
        title: "Proyecto de laboratorio",
        content:
          "Los alumnos de ciencias presentaran sus proyectos finales la proxima semana.",
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
