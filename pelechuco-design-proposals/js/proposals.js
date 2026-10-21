/**
 * PELECHUCO DIGITAL — Datos Oficiales de Demostración
 * Gobierno Autónomo Municipal de Pelechuco, Provincia Franz Tamayo, La Paz, Bolivia
 */

const PELECHUCO_DATA = {

  institucion: {
    nombre: "Gobierno Autónomo Municipal de Pelechuco",
    nombreCorto: "GAM Pelechuco",
    departamento: "La Paz",
    provincia: "Franz Tamayo",
    pais: "Bolivia",
    eslogan: "Tierra de Montañas, Raíces Vivas y Progreso Comunitario",
    direccion: "Plaza Principal 25 de Mayo s/n, Acera Norte, Edificio Consistorial",
    telefono: "(+591) 2 214-5890",
    celular: "(+591) 715-84210",
    emergencias: "Línea 114 Pelechuco (Atención 24 Horas)",
    correo: "contacto@pelechuco.gob.bo",
    correoDespacho: "alcaldia@pelechuco.gob.bo",
    horarioAtencion: "Lunes a Viernes de 08:30 a 16:30 (Horario continuo)",
    sitioWeb: "https://pelechuco.gob.bo",
    altitud: "3.600 m s. n. m.",
    superficie: "2.714 km²",
    poblacion: "6.850 habitantes",
    cantones: "Pelechuco Central, Ulla Ulla, Antaquilla, Hichocollo, Queara, Puina, Suches, Katantika, Agua Blanca",
  },

  // Noticias completas con contenido informativo verosímil
  noticias: [
    {
      id: 1,
      titulo: "Rehabilitación y ensanchamiento del tramo vial Pelechuco - Ulla Ulla concluye con éxito",
      resumen: "La Dirección de Obras Públicas finalizó los trabajos de mantenimiento de caminos y drenajes pluviales, garantizando el tránsito seguro de productores y transporte vecinal.",
      contenidoCompleto: "El Gobierno Autónomo Municipal de Pelechuco, mediante la Dirección de Obras Públicas y Maquinaria Pesada, concluyó con éxito las faenas de mantenimiento, perfilado y ensanche de la plataforma vial en el tramo troncal que conecta la capital municipal con el cantón Ulla Ulla. Esta ruta estratégica permite el transporte diario de lana de alpaca, productos agrícolas y facilita el acceso de brigadas de salud hacia los ayllus más alejados.",
      categoria: "Obras",
      fecha: "2026-10-20",
      imagen: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
      imagenAlt: "Maquinaria municipal en mantenimiento de caminos andinos",
      estado: "publicado",
      slug: "rehabilitacion-vial-pelechuco-ulla-ulla"
    },
    {
      id: 2,
      titulo: "Concejo Municipal aprueba Ley de Fomento a la Producción y Transformación de Fibra de Alpaca",
      resumen: "La normativa municipal canaliza asistencia técnica, equipamiento para centros de acopio y capacitación artesanal para más de 40 comunidades alpaqueras.",
      contenidoCompleto: "En sesión ordinaria de honor, el Concejo Municipal de Pelechuco aprobó por unanimidad la Ley Municipal N° 048/2026 orientada a la reactivación productiva camélida. El programa contempla la dotación de esquiladoras mecánicas, asistencia veterinaria y la apertura de mercados justos en coordinación con artesanas de Apolobamba.",
      categoria: "Institucional",
      fecha: "2026-10-18",
      imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      imagenAlt: "Sesión del Concejo Municipal de Pelechuco",
      estado: "publicado",
      slug: "ley-fomento-fibra-alpaca"
    },
    {
      id: 3,
      titulo: "Brigadas médicas municipales recorren postas de salud comunales con entrega de insumos",
      resumen: "Personal de la Red de Salud Franz Tamayo brindó atención odontológica, control prenatal, medicina general y vacunación infantil en Puina y Queara.",
      contenidoCompleto: "Con el objetivo de garantizar una atención digna y oportuna, la Dirección de Desarrollo Humano y Salud del municipio desplegó brigadas móviles multidisciplinarias. Se dotaron medicamentos esenciales a los botiquines comunales y se realizaron exámenes preventivos a más de 300 comunarios de sectores de alta montaña.",
      categoria: "Salud",
      fecha: "2026-10-14",
      imagen: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      imagenAlt: "Atención médica preventiva comunitaria",
      estado: "publicado",
      slug: "brigadas-medicas-comunales"
    },
    {
      id: 4,
      titulo: "Feria Anual de Camélidos y Ecoturismo Apolobamba 2026 reúne a delegaciones del norte paceño",
      resumen: "Exposición de ejemplares campeones de alpacas Huacaya y Suri, tejidos finos tradicionales y platos típicos andinos en el campo ferial municipal.",
      contenidoCompleto: "Pelechuco vivió tres jornadas de fiesta, cultura y dinamización económica en el marco de su Feria Productiva Anual. Comunidades de Antaquilla, Hichocollo y Suches exhibieron sus mejores piezas de textilería ancestral teñida con tintes naturales de flora andina, atrayendo a visitantes e investigadores de todo el país.",
      categoria: "Cultura",
      fecha: "2026-10-08",
      imagen: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
      imagenAlt: "Feria cultural y ganadera en Pelechuco",
      estado: "publicado",
      slug: "feria-camelidos-apolobamba-2026"
    },
    {
      id: 5,
      titulo: "Entrega de equipamiento tecnológico y mobiliario escolar a unidades educativas rurales",
      resumen: "Estudiantes de primaria y secundaria de centros educativos del municipio recibieron módulos de computación, bibliotecas escolares y material pedagógico.",
      contenidoCompleto: "El alcalde municipal encabezó el acto oficial de entrega de material educativo y equipamiento informático para cinco unidades educativas. Esta iniciativa busca reducir la brecha digital en el área rural y mejorar las condiciones de aprendizaje de la niñez y juventud pelechuqueña.",
      categoria: "Educación",
      fecha: "2026-09-29",
      imagen: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
      imagenAlt: "Equipamiento para escuelas rurales",
      estado: "publicado",
      slug: "entrega-mobiliario-escolar"
    },
    {
      id: 6,
      titulo: "Plan de Reforestación y Protección de Cuencas Hídricas en el Área Natural Apolobamba",
      resumen: "En alianza con guardaparques y autoridades originarias, se plantaron más de 5.000 queñuas para preservar las nacientes de agua dulce.",
      contenidoCompleto: "La Unidad de Medio Ambiente y Recursos Hídricos lideró una masiva jornada comunitaria de reforestación con especies nativas en las microcuencas que alimentan al río Pelechuco. Esta acción previene la erosión del suelo y salvaguarda las reservas hídricas frente al cambio climático.",
      categoria: "Medio Ambiente",
      fecha: "2026-09-22",
      imagen: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80",
      imagenAlt: "Preservación ambiental en la cordillera andina",
      estado: "publicado",
      slug: "reforestacion-cuencas-apolobamba"
    },
  ],

  categorias: ["Todos", "Institucional", "Obras", "Salud", "Cultura", "Educación", "Medio Ambiente"],

  // Catálogo completo de trámites con requisitos y plazos realistas
  tramites: [
    {
      id: 1,
      nombre: "Certificado de Registro Catastral y Derecho Propietario",
      descripcion: "Emisión de certificación catastral técnica para inmuebles urbanos y predios comunales con delimitación geográfica oficial.",
      categoria: "Urbanismo",
      requisitos: [
        "Fotocopia simple de Cédula de Identidad del propietario vigente",
        "Plano topográfico georreferenciado visado por la Dirección de Catastro",
        "Título ejecutorial o minuta de compraventa debidamente protocolizada",
        "Comprobante de no adeudo tributario municipal del año en curso",
        "Formulario F-CAT-01 de solicitud debidamente llenado"
      ],
      oficina: "Dirección de Catastro y Urbanismo (Planta Baja, Ventanilla 2)",
      horario: "Lunes a Viernes de 08:30 a 14:00",
      costo: "Bs. 50 (según arancel municipal)",
      plazo: "3 a 5 días hábiles",
      contacto: "catastro@pelechuco.gob.bo · Int. 102",
    },
    {
      id: 2,
      nombre: "Licencia de Funcionamiento para Actividades Económicas",
      descripcion: "Autorización municipal para la apertura, operación y registro legal de comercios, hospedajes, servicios y microempresas locales.",
      categoria: "Actividad Económica",
      requisitos: [
        "Formulario de solicitud F-101 debidamente firmado por el titular",
        "Fotocopia de C.I. del propietario o representante legal",
        "Fotocopia de NIT vigente (cuando corresponda)",
        "Certificado de compatibilidad de uso de suelo y zonificación",
        "Inspección técnica favorable de sanidad y seguridad de la Intendencia"
      ],
      oficina: "Unidad de Recaudaciones y Patentes (Planta Baja, Ventanilla 1)",
      horario: "Lunes a Viernes de 08:30 a 16:00",
      costo: "Bs. 80 (renovación anual según categoría)",
      plazo: "48 horas hábiles",
      contacto: "patentes@pelechuco.gob.bo · Int. 104",
    },
    {
      id: 3,
      nombre: "Permiso de Construcción y Refacción de Inmuebles",
      descripcion: "Autorización técnica y legal para edificaciones nuevas, ampliaciones o remodelaciones en el radio urbano y comunal.",
      categoria: "Urbanismo",
      requisitos: [
        "Planos arquitectónicos y de elevación firmados por profesional habilitado",
        "Certificado catastral actualizado otorgado por el GAM Pelechuco",
        "Fotocopia de C.I. del solicitante y título de propiedad del predio",
        "Boleta de depósito bancario de arancel de revisión de obras"
      ],
      oficina: "Dirección de Obras Públicas (Primer Piso, Of. 104)",
      horario: "Lunes a Viernes de 09:00 a 15:30",
      costo: "Según superficie construida (Bs. 1.50 por m²)",
      plazo: "5 días hábiles",
      contacto: "obras@pelechuco.gob.bo · Int. 105",
    },
    {
      id: 4,
      nombre: "Certificación de Límites y Jurisdicción Comunal",
      descripcion: "Documento oficial que acredita la pertenencia comunal, límites ancestrales de ayllus y personería de organizaciones sociales.",
      categoria: "Registro Civil",
      requisitos: [
        "Nota formal de solicitud suscrita por autoridades originarias de la comunidad",
        "Acta de posesión comunal y personería jurídica de la central agraria",
        "Croquis referencial de colindancias y mojones tradicionales"
      ],
      oficina: "Secretaría General y Relacionamiento Comunitario (Piso 2)",
      horario: "Lunes a Viernes de 08:30 a 16:30",
      costo: "Trámite Gratuito",
      plazo: "24 a 48 horas",
      contacto: "secretaria@pelechuco.gob.bo · Int. 101",
    },
    {
      id: 5,
      nombre: "Pago de Impuesto a la Propiedad de Bienes Inmuebles y Vehículos",
      descripcion: "Liquidación y cobro de impuestos municipales anuales con descuentos de hasta el 15% por pronto pago.",
      categoria: "Tributos",
      requisitos: [
        "Número de padrón tributario municipal o comprobante de pago anterior",
        "Fotocopia de Cédula de Identidad del titular o apoderado legal",
        "RUAT vehicular en caso de automotores y motocicletas"
      ],
      oficina: "Administración Tributaria Municipal (ATM Pelechuco)",
      horario: "Lunes a Viernes de 08:30 a 16:30",
      costo: "Según avalúo fiscal y escala impositiva vigente",
      plazo: "Inmediato en ventanilla o banca autorizada",
      contacto: "tributos@pelechuco.gob.bo · Int. 103",
    },
  ],

  categoriasTramites: ["Todos", "Registro Civil", "Urbanismo", "Actividad Económica", "Tributos"],

  // Autoridades municipales completas con nombres, cargos, biografías y correos
  autoridades: [
    {
      id: 1,
      cargo: "Alcalde Municipal",
      nombre: "Lic. Pedro Mamani Huanca",
      descripcion: "Economista y líder comunitario oriundo de Franz Tamayo. Cuenta con más de 12 años de experiencia en gestión pública andina, ejecución de proyectos viales y fomento a la producción camélida.",
      area: "Despacho del Alcalde",
      foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      contactoInstitucional: "alcaldia@pelechuco.gob.bo · (+591) 715-84210",
    },
    {
      id: 2,
      cargo: "Presidenta del Concejo Municipal",
      nombre: "Sra. Martha Condori Ticona",
      descripcion: "Representante de las organizaciones de mujeres productoras de Ulla Ulla. Ejerce la fiscalización municipal promoviendo normativas de salud comunitaria, educación bilingüe y protección ambiental.",
      area: "Concejo Municipal",
      foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      contactoInstitucional: "concejo@pelechuco.gob.bo",
    },
    {
      id: 3,
      cargo: "Concejal Secretario",
      nombre: "Sr. Juan Carlos Hilari Choque",
      descripcion: "Docente rural y legislador municipal. Coordina las comisiones de infraestructura, límites intercantonales y preservación del patrimonio histórico de Pelechuco.",
      area: "Concejo Municipal",
      foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      contactoInstitucional: "jhilari@pelechuco.gob.bo",
    },
    {
      id: 4,
      cargo: "Director de Obras Públicas y Catastro",
      nombre: "Arq. Marcelo Ramos Flores",
      descripcion: "Especialista en planificación territorial de alta montaña, caminos vecinales y diseño de infraestructura sostenible adaptada al clima andino.",
      area: "Dirección de Obras Públicas",
      foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      contactoInstitucional: "obras@pelechuco.gob.bo",
    },
    {
      id: 5,
      cargo: "Directora de Desarrollo Humano y Salud",
      nombre: "Dra. Elena Vargas Colque",
      descripcion: "Médico salubrista comprometida con la atención primaria en postas rurales, campañas de nutrición materno-infantil y prevención sanitaria en todo el municipio.",
      area: "Desarrollo Humano y Salud",
      foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      contactoInstitucional: "salud@pelechuco.gob.bo",
    },
    {
      id: 6,
      cargo: "Jefe de Administración y Finanzas (ATM)",
      nombre: "Lic. Javier Mendoza Poma",
      descripcion: "Auditor financiero con amplia experiencia en transparencia presupuestaria, gestión de recursos estatales y modernización de la recaudación tributaria.",
      area: "Administración Tributaria Municipal",
      foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      contactoInstitucional: "finanzas@pelechuco.gob.bo",
    },
  ],

  // Imágenes de alta resolución de paisajes andinos y comunidad
  imagenes: {
    hero: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=85",
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1600&q=85",
    ],
    paisaje: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
      "https://images.unsplash.com/photo-1531804065854-c7b4f00e6b82?w=800&q=80",
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
    ],
  },

};

// Exportar para uso en módulos
if (typeof module !== 'undefined') {
  module.exports = PELECHUCO_DATA;
}
