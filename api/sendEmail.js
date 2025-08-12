// /api/sendEmail.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { to, subject, template, variables } = req.body;

  if (!to || !subject || !template || !variables) {
    return res
      .status(400)
      .json({ error: "Faltan datos en el cuerpo de la solicitud." });
  }

  // Plantillas disponibles
  const templates = {
    plantillaNuevaPostulacion: `<body
        style="
          font-family: Montserrat, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #5b5b5b;
        "
      >
        <div style="background-color: #043144; padding: 20px; text-align: center">
          <img
            alt="Logo UMNG"
            class="header-logo"
            src="https://i.ibb.co/QZndfNM/Logo-UMNG-8bb99b40804dbb5b1de3.png"
            style="max-height: 60px"
          />
          <h3 style="color: white; margin: 10px 0">
            Portal Centro de Investigaciones
          </h3>
        </div>
        <div
          style="
            background-color: #ffffff;
            margin: 20px;
            padding: 20px;
            border-radius: 8px;
            width: 700px;
            margin: 30px auto;
          "
        >
          <h1 style="color: #043144">Nueva postulación para revisar</h1>

          <h2 style="color: #5b5b5b">
            Proyecto: <span style="font-weight: normal">{{CODIGO_PROYECTO}}</span>
          </h2>
          <p>Estimado/a revisor <strong>{{NOMBRE_REVISOR}}</strong>,</p>

          <p>
            Se ha recibido una nueva postulación para el proyecto
            <strong>{{CODIGO_PROYECTO}}</strong> que requiere tu revisión.
          </p>

          <p>Detalles de la postulación:</p>

          <ul>
            <li><strong>Postulante:</strong> {{NOMBRE_POSTULANTE}}</li>
            <li><strong>Tipo de vinculación:</strong> {{TIPO_VINCULACION}}</li>
            <li><strong>Modalidad de contrato:</strong> {{TIPO_CONTRATO}}</li>
            <li><strong>Fecha de postulación:</strong> {{FECHA_POSTULACION}}</li>
          </ul>

          <div
            style="
              background-color: #f230301a;
              color: #f23030;
              padding: 0.5em;
              border-radius: 5px;
              padding-left: 20px;
              font-size: 1.2em;
              font-weight: bold;
              max-width: 300px;
              margin: 30px 0 0 21px;
            "
          >
            Pendiente de revisión
          </div>

          <br />

          <p>
            Por favor ingresa al portal del Centro de Investigaciones para realizar la
            revisión de los documentos adjuntos.
          </p>

          <hr style="margin: 2em 0" />

          <p style="margin-top: 2em">
            <strong>Centro de Investigaciones UMNG</strong>
          </p>
        </div>
        <div
          style="background-color: #043144; padding: 10px; text-align: center"
        ></div>
      </body>
      `,
    plantillaReenvio: `<body
        style="
          font-family: Montserrat, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #5b5b5b;
        "
      >
        <div style="background-color: #043144; padding: 20px; text-align: center">
          <img
            alt="Logo UMNG"
            class="header-logo"
            src="https://i.ibb.co/QZndfNM/Logo-UMNG-8bb99b40804dbb5b1de3.png"
            style="max-height: 60px"
          />
          <h3 style="color: white; margin: 10px 0">
            Portal Centro de Investigaciones
          </h3>
        </div>
        <div
          style="
            background-color: #ffffff;
            margin: 20px;
            padding: 20px;
            border-radius: 8px;
            width: 700px;
            margin: 30px auto;
          "
        >
          <h1 style="color: #043144">Documentos corregidos para revisión</h1>

          <h2 style="color: #5b5b5b">
            Proyecto: <span style="font-weight: normal">{{CODIGO_PROYECTO}}</span>
          </h2>
          <p>Estimado/a revisor <strong>{{NOMBRE_REVISOR}}</strong>,</p>

          <p>
            El docente <strong>{{NOMBRE_DOCENTE}}</strong> ha realizado correcciones
            en los documentos de la postulación de
            <strong>{{NOMBRE_POSTULANTE}}</strong> al proyecto
            <strong>{{CODIGO_PROYECTO}}</strong> y los ha vuelto a enviar para su
            revisión.
          </p>

          <p>
            <strong>Detalles de la postulación:</strong>
          </p>
          <ul>
            <li><strong>Tipo de vinculación:</strong> {{TIPO_VINCULACION}}</li>
            <li><strong>Modalidad de contrato:</strong> {{TIPO_CONTRATO}}</li>
            <li><strong>Fecha de reenvío:</strong> {{FECHA_REVISION}}</li>
          </ul>

          <div
            style="
              background-color: #e7b7171a;
              color: #e7b717;
              padding: 0.5em;
              padding-left: 20px;
              border-radius: 5px;
              font-size: 1.2em;
              font-weight: bold;
              max-width: 300px;
              margin: 30px 0 0 21px;
            "
          >
            En corrección
          </div>

          <br />

          <p>
            Por favor ingresa al portal del Centro de Investigaciones para revisar las
            correcciones realizadas por el docente y verificar si cumplen con los
            requisitos solicitados.
          </p>

          <hr style="margin: 2em 0" />

          <p style="margin-top: 2em">
            <strong>Centro de Investigaciones UMNG</strong>
          </p>
        </div>
        <div
          style="background-color: #043144; padding: 10px; text-align: center"
        ></div>
      </body>
      `,
    plantillaRevision: `<body
        style="
          font-family: Montserrat, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #5b5b5b;
        "
      >
        <div
          style="
            background-color: #043144;
            padding: 20px;
            text-align: center;
          "
        >
          <img
            alt="Logo UMNG"
            class="header-logo"
            src="https://i.ibb.co/QZndfNM/Logo-UMNG-8bb99b40804dbb5b1de3.png"
            style="max-height: 60px"
          />
          <h3 style="color: white;margin: 10px 0;">Portal Centro de Investigaciones</h3>
        </div>
        <div
          style="
            background-color: #ffffff;
            margin: 20px;
            padding: 20px;
            border-radius: 8px;
            width: 700px;
            margin: 30px auto;
          "
        >
          <h1 style="color: #043144">Resultado de la revisión de tu postulación</h1>

          <h2 style="color: #5b5b5b">
            Proyecto: <span style="font-weight: normal">{{CODIGO_PROYECTO}}</span>
          </h2>
          <p>Estimado/a <strong>{{NOMBRE_DOCENTE}}</strong>,</p>

          <p>
            Hemos completado el proceso de revisión de los documentos enviados para la
            postulación de <strong>{{NOMBRE_POSTULANTE}}</strong> al proyecto
            <strong>{{CODIGO_PROYECTO}}</strong>. Esta postulación corresponde a una
            <strong>{{TIPO_VINCULACION}}</strong> bajo la modalidad de
            <strong>{{TIPO_CONTRATO}}</strong>. El resultado general de esta revisión
            ha sido:
          </p>

          <div
            style="background-color: {{COLOR_FONDO_ESTADO}}; color: {{COLOR_ESTADO}};padding: 0.5em;border-radius: 5px;text-align: center;font-size: 1.2em;font-weight: bold;max-width: 300px;margin: auto;"
          >
            {{ESTADO}}
          </div>

          <br />

          {{#IF_EN_CORRECCION}}
          <p>
            Algunos de tus documentos necesitan ser corregidos. Te invitamos a
            ingresar a la plataforma para consultar los comentarios específicos
            realizados por el revisor. Podrás reenviar únicamente los documentos que
            requieren ajustes.
          </p>
          {{/IF_EN_CORRECCION}} {{#IF_APROBADO}}
          <p>
            Todos los documentos presentados han sido aprobados. Tu postulación ahora
            se encuentra en estado aprobado y no requiere más acciones de tu parte en
            esta etapa.
          </p>
          {{/IF_APROBADO}}

          <hr style="margin: 2em 0" />

          <p style="font-size: 0.9em; color: #666">
            Si tienes preguntas o necesitas soporte, puedes comunicarte con el equipo
            del Centro de Investigaciones.
          </p>

          <p style="margin-top: 2em">
            Atentamente,<br />
            <strong>Equipo de Revisores</strong><br />
            Centro de Investigaciones UMNG
          </p>
        </div>
        <div
          style="background-color: #043144; padding: 10px; text-align: center"
        ></div>
      </body>
      `,
  };

  if (!templates[template]) {
    return res
      .status(404)
      .json({ error: `La plantilla '${template}' no existe.` });
  }

  try {
    // Crear transporte SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Procesar plantilla
    let htmlContent = templates[template];

    if (variables.ESTADO === "En corrección") {
      htmlContent = htmlContent
        .replace(/{{#IF_EN_CORRECCION}}([\s\S]*?){{\/IF_EN_CORRECCION}}/g, "$1")
        .replace(/{{#IF_APROBADO}}([\s\S]*?){{\/IF_APROBADO}}/g, "");
    } else {
      htmlContent = htmlContent
        .replace(/{{#IF_EN_CORRECCION}}([\s\S]*?){{\/IF_EN_CORRECCION}}/g, "")
        .replace(/{{#IF_APROBADO}}([\s\S]*?){{\/IF_APROBADO}}/g, "$1");
    }

    htmlContent = htmlContent.replace(
      /{{COLOR_ESTADO}}/g,
      variables.ESTADO === "Aprobado" ? "#4caf50" : "#f9b233"
    );

    htmlContent = htmlContent.replace(
      /{{COLOR_FONDO_ESTADO}}/g,
      variables.ESTADO === "Aprobado" ? "#69c0511a" : "#e7b7171a"
    );

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      htmlContent = htmlContent.replace(placeholder, value);
    });

    // Enviar correo
    await transporter.sendMail({
      from: `"Centro de Investigaciones" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    return res.status(200).json({ message: "Correo enviado correctamente." });
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    return res
      .status(500)
      .json({ error: "Error interno al enviar el correo." });
  }
}
