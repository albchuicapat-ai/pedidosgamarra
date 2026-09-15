const CLAVE = "textil_s4";
const pagina = document.body.dataset.pagina;
let datos = null;

try {
  datos = JSON.parse(sessionStorage.getItem(CLAVE));
} catch {
  sessionStorage.removeItem(CLAVE);
}

const form = document.querySelector("#textil");
if (form) {
  // Restaurar al editar
  if (datos) {
    for (const campo of ["contacto","correo","color","s","m","l","observaciones"]) {
      form.elements[campo].value = datos[campo] || "";
    }
    form.elements.estampado.checked = datos.estampado || false;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const mensaje = document.querySelector("#mensaje");

    const contacto = form.elements.contacto.value.trim();
    const correo = form.elements.correo.value.trim();
    const color = form.elements.color.value;
    const s = Number(form.elements.s.value);
    const m = Number(form.elements.m.value);
    const l = Number(form.elements.l.value);
    const estampado = form.elements.estampado.checked;
    const observaciones = form.elements.observaciones.value.trim();

    if (!contacto || !correo || !color) {
      mensaje.textContent = "Completa contacto, correo y color.";
      return;
    }
    if (![s,m,l].every(n => Number.isInteger(n) && n >= 0 && n <= 200)) {
      mensaje.textContent = "Cantidades inválidas.";
      return;
    }

    const totalUnidades = s + m + l;
    if (totalUnidades < 1) {
      mensaje.textContent = "El total debe ser al menos 1.";
      return;
    }
    if (totalUnidades > 200) {
      mensaje.textContent = "El total no puede superar 200.";
      return;
    }

    // Cálculo
    const precioPrenda = 18;
    const subtotalPrendas = totalUnidades * precioPrenda;
    const descuento = totalUnidades >= 24 ? Math.round(subtotalPrendas * 0.07 * 100) / 100 : 0;
    const costoEstampado = estampado ? totalUnidades * 4 : 0;
    const total = subtotalPrendas - descuento + costoEstampado;

    datos = {
      contacto, correo, color,
      s, m, l,
      totalUnidades,
      descuento,
      costoEstampado,
      total,
      observaciones,
      estado: "borrador"
    };

    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
    location.href = "confirmar.html";
  });
}

// Parte 2: confirmar y resumen
if (pagina === "confirmar" || pagina === "resumen") {
  if (!datos) {
    location.replace("index.html");
  } else if (pagina === "resumen" && datos.estado !== "confirmado") {
    location.replace("confirmar.html");
  } else {
    document.querySelector("#detalle").textContent = [
      "Contacto: " + datos.contacto,
      "Correo: " + datos.correo,
      "Color: " + datos.color,
      "Talla S: " + datos.s,
      "Talla M: " + datos.m,
      "Talla L: " + datos.l,
      "Total unidades: " + datos.totalUnidades,
      "Descuento: S/ " + datos.descuento.toFixed(2),
      "Estampado: S/ " + datos.costoEstampado.toFixed(2),
      "Total: S/ " + datos.total.toFixed(2),
      "Observaciones: " + (datos.observaciones || "Sin observaciones"),
      "Estado: " + datos.estado
    ].join("\n");

    if (pagina === "confirmar") {
  document.querySelector("#confirmar").addEventListener("click", () => {
    datos.estado = "confirmado";
    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
    location.href = "resumen.html";
  });
    } else {
  document.querySelector("#nuevo").addEventListener("click", () => {
    sessionStorage.removeItem(CLAVE);
    location.href = "index.html";
  });
}
}
}
