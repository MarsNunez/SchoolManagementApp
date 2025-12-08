import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { StaffModel } from "../models/Staff.js";
import { TeacherModel } from "../models/Teacher.js";
import { CourseModel } from "../models/Course.js";
import { StudyPlanModel } from "../models/StudyPlan.js";
import { SectionModel } from "../models/Section.js";
import { StudentModel } from "../models/Student.js";
import { PostModel } from "../models/Post.js";

dotenv.config();

const makeId = (prefix, num) => `${prefix}-${num.toString().padStart(6, "0")}`;

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
      SectionModel.deleteMany({}),
      StudentModel.deleteMany({}),
      PostModel.deleteMany({}),
    ]);

    // STAFF (Admins + Secretaries)
    const staffRaw = [
      {
        staff_id: makeId("STF", 1),
        name: "Lucia",
        lastname: "Ramirez",
        dni: 70234561,
        email: "1@1.com",
        password: "1",
        role: "admin",
        state: true,
      },
      {
        staff_id: makeId("STF", 2),
        name: "Diego",
        lastname: "Salazar",
        dni: 70234562,
        email: "diego.salazar@colegio.edu",
        password: "Admin#2",
        role: "admin",
        state: true,
      },
      {
        staff_id: makeId("STF", 3),
        name: "Rosa",
        lastname: "Valdes",
        dni: 71234563,
        email: "2@2.com",
        password: "2",
        role: "secretary",
        state: true,
      },
      {
        staff_id: makeId("STF", 4),
        name: "Maria",
        lastname: "Huaman",
        dni: 71234564,
        email: "maria.huaman@colegio.edu",
        password: "Secretaria#2",
        role: "secretary",
        state: true,
      },
      {
        staff_id: makeId("STF", 5),
        name: "Karen",
        lastname: "Lagos",
        dni: 71234565,
        email: "karen.lagos@colegio.edu",
        password: "Secretaria#3",
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

    // TEACHERS
    const teacherSeed = [
      {
        teacher_id: makeId("TEA", 1),
        name: "Rafael",
        lastname: "Mendoza",
        dni: 76230011,
        specialties: ["Matematica", "Fisica"],
        email: "rafael.mendoza@colegio.edu",
        phone: "+51987654321",
      },
      {
        teacher_id: makeId("TEA", 2),
        name: "Carolina",
        lastname: "Paredes",
        dni: 76230012,
        specialties: ["Historia", "Civica"],
        email: "carolina.paredes@colegio.edu",
        phone: "+51987654322",
      },
      {
        teacher_id: makeId("TEA", 3),
        name: "German",
        lastname: "Silva",
        dni: 76230013,
        specialties: ["Biologia", "Quimica"],
        email: "german.silva@colegio.edu",
        phone: "+51987654323",
      },
    ];
    await TeacherModel.insertMany(teacherSeed);
    console.log(`Inserted ${teacherSeed.length} teachers`);

    // COURSES
    const courseSeed = [
      {
        course_id: makeId("CUR", 1),
        title: "Matematica I",
        description: "Fundamentos de algebra y geometria.",
        teacher_id: teacherSeed[0].teacher_id,
        duration: 60,
      },
      {
        course_id: makeId("CUR", 2),
        title: "Fisica I",
        description: "Movimiento, fuerza y energia.",
        teacher_id: teacherSeed[0].teacher_id,
        duration: 48,
      },
      {
        course_id: makeId("CUR", 3),
        title: "Historia del Peru",
        description:
          "Repaso cronologico desde las culturas preincas hasta la republica.",
        teacher_id: teacherSeed[1].teacher_id,
        duration: 56,
      },
      {
        course_id: makeId("CUR", 4),
        title: "Literatura Hispanoamericana",
        description: "Autores clasicos y contemporaneos.",
        teacher_id: teacherSeed[1].teacher_id,
        duration: 50,
      },
      {
        course_id: makeId("CUR", 5),
        title: "Biologia General",
        description: "Estructura celular y sistemas del cuerpo humano.",
        teacher_id: teacherSeed[2].teacher_id,
        duration: 52,
      },
      {
        course_id: makeId("CUR", 6),
        title: "Quimica I",
        description: "Quimica organica basica y reacciones.",
        teacher_id: teacherSeed[2].teacher_id,
        duration: 52,
      },
      {
        course_id: makeId("CUR", 7),
        title: "Ingles Comunicativo",
        description: "Comprension y produccion oral.",
        teacher_id: teacherSeed[1].teacher_id,
        duration: 45,
      },
      {
        course_id: makeId("CUR", 8),
        title: "Arte y Creatividad",
        description: "Exploracion de tecnicas artisticas mixtas.",
        teacher_id: teacherSeed[1].teacher_id,
        duration: 40,
      },
      {
        course_id: makeId("CUR", 9),
        title: "Tecnologia y Robotica",
        description: "Fundamentos de programacion y robotica educativa.",
        teacher_id: teacherSeed[0].teacher_id,
        duration: 60,
      },
      {
        course_id: makeId("CUR", 10),
        title: "Etica y Ciudadania",
        description: "Formacion en valores y convivencia escolar.",
        teacher_id: teacherSeed[1].teacher_id,
        duration: 38,
      },
    ];
    await CourseModel.insertMany(courseSeed);
    console.log(`Inserted ${courseSeed.length} courses`);

    // STUDY PLANS
    const studyPlanSeed = [
      {
        studyPlan_id: makeId("STP", 1),
        level: "secundaria",
        version: 1,
        effectiveFrom: new Date("2025-03-01"),
        state: "active",
        grade: 5,
        minGrade: 12,
        courses: [
          courseSeed[0].course_id,
          courseSeed[1].course_id,
          courseSeed[4].course_id,
          courseSeed[5].course_id,
          courseSeed[7].course_id,
        ],
      },
      {
        studyPlan_id: makeId("STP", 2),
        level: "secundaria",
        version: 1,
        effectiveFrom: new Date("2025-03-01"),
        state: "active",
        grade: 4,
        minGrade: 12,
        courses: [
          courseSeed[2].course_id,
          courseSeed[3].course_id,
          courseSeed[7].course_id,
          courseSeed[8].course_id,
          courseSeed[9].course_id,
        ],
      },
    ];
    await StudyPlanModel.insertMany(studyPlanSeed);
    console.log(`Inserted ${studyPlanSeed.length} study plans`);

    // SECTIONS
    const sectionSeed = [
      {
        section_id: makeId("SEC", 1),
        title: "Secundaria 5A",
        studyPlan_id: studyPlanSeed[0].studyPlan_id,
        group: "A",
        teacher_id: teacherSeed[0].teacher_id,
        year: 2025,
        start_capacity: 30,
      },
      {
        section_id: makeId("SEC", 2),
        title: "Secundaria 5B",
        studyPlan_id: studyPlanSeed[0].studyPlan_id,
        group: "B",
        teacher_id: teacherSeed[1].teacher_id,
        year: 2025,
        start_capacity: 30,
      },
      {
        section_id: makeId("SEC", 3),
        title: "Secundaria 4A",
        studyPlan_id: studyPlanSeed[1].studyPlan_id,
        group: "C",
        teacher_id: teacherSeed[2].teacher_id,
        year: 2025,
        start_capacity: 28,
      },
    ];
    await SectionModel.insertMany(sectionSeed);
    console.log(`Inserted ${sectionSeed.length} sections`);

    // STUDENTS
    const studentSeed = [
      {
        student_id: makeId("EST", 1),
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
        section_id: sectionSeed[0].section_id,
      },
      {
        student_id: makeId("EST", 2),
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
        section_id: sectionSeed[0].section_id,
      },
      {
        student_id: makeId("EST", 3),
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
        section_id: sectionSeed[0].section_id,
      },
      {
        student_id: makeId("EST", 4),
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
        section_id: sectionSeed[1].section_id,
      },
      {
        student_id: makeId("EST", 5),
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
        section_id: sectionSeed[1].section_id,
      },
      {
        student_id: makeId("EST", 6),
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
        section_id: sectionSeed[1].section_id,
      },
      {
        student_id: makeId("EST", 7),
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
        section_id: sectionSeed[2].section_id,
      },
      {
        student_id: makeId("EST", 8),
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
        section_id: sectionSeed[2].section_id,
      },
    ];
    await StudentModel.insertMany(studentSeed);
    console.log(`Inserted ${studentSeed.length} students`);

    // POSTS
    const postSeed = [
      {
        title: "Inicio de ano escolar",
        content:
          "Bienvenidos al ano academico 2025. Revisen los horarios adjuntos.",
        links: [
          "https://colegio.edu/horarios-2025.pdf",
          "https://colegio.edu/reglamento.pdf",
        ],
        creator_id: teacherSeed[0].teacher_id,
      },
      {
        title: "Reunion de padres",
        content:
          "Se convoca a reunion informativa el proximo viernes a las 7 pm.",
        links: ["https://colegio.edu/agenda-reunion"],
        creator_id: teacherSeed[1].teacher_id,
      },
      {
        title: "Proyecto de laboratorio",
        content:
          "Los alumnos de ciencias presentaran sus proyectos finales la proxima semana.",
        links: ["https://colegio.edu/proyectos-ciencias"],
        creator_id: teacherSeed[2].teacher_id,
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
