// ============================================================
// PARQUE P5 — Google Apps Script para captura de reservas
// ============================================================
// INSTRUÇÕES DE INSTALAÇÃO:
// 1. Vai a https://sheets.google.com → cria uma nova folha chamada "Reservas P5"
// 2. No menu: Extensões → Apps Script
// 3. Apaga todo o código existente e cola este ficheiro completo
// 4. Clica em "Guardar" (ícone de disquete)
// 5. No menu: Implementar → Nova implementação
//    - Tipo: Aplicação Web
//    - Executar como: Eu (o teu email)
//    - Quem tem acesso: Qualquer pessoa
// 6. Clica "Implementar" → copia o URL gerado
// 7. Cola esse URL na landing page (variável APPS_SCRIPT_URL)
// ============================================================

const SHEET_NAME = "Reservas";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Data/Hora Pedido",
        "Nome",
        "Telefone",
        "Email",
        "Matrícula",
        "Data Entrada",
        "Voo Partida",
        "Data Saída",
        "Voo Regresso",
        "Dias",
        "Tipo Estacionamento",
        "Extras",
        "Estimativa (€)",
        "Notas",
        "Estado"
      ]);
      const headerRange = sheet.getRange(1, 1, 1, 15);
      headerRange.setBackground("#E10600");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 180);
      sheet.setColumnWidth(3, 130);
      sheet.setColumnWidth(4, 200);
      sheet.setColumnWidth(5, 110);
      sheet.setColumnWidth(6, 150);
      sheet.setColumnWidth(7, 120);
      sheet.setColumnWidth(8, 150);
      sheet.setColumnWidth(9, 120);
      sheet.setColumnWidth(10, 70);
      sheet.setColumnWidth(11, 160);
      sheet.setColumnWidth(12, 220);
      sheet.setColumnWidth(13, 120);
      sheet.setColumnWidth(14, 200);
      sheet.setColumnWidth(15, 100);
    }

    const now = new Date();
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

    sheet.appendRow([
      timestamp,
      data.nome || "",
      data.telefone || "",
      data.email || "",
      data.matricula || "",
      data.entrada || "",
      data.voo_partida || "-",
      data.saida || "",
      data.voo_regresso || "-",
      data.dias || "",
      data.tipo || "",
      data.extras || "",
      data.estimativa || "",
      data.notas || "",
      "Pendente"
    ]);

    const lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, 15).setBackground("#f9f9f9");
    }
    sheet.getRange(lastRow, 15).setBackground("#fff3cd").setFontWeight("bold");

    const emailBody = `
Nova reserva recebida no ParqueP5!

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DADOS DO CLIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome:         ${data.nome}
Telefone:     ${data.telefone}
Email:        ${data.email}
Matrícula:    ${data.matricula || "Não indicada"}

━━━━━━━━━━━━━━━━━━━━━━━━━━
✈️ DETALHES DA VIAGEM
━━━━━━━━━━━━━━━━━━━━━━━━━━
Entrada:      ${data.entrada}
Voo Partida:  ${data.voo_partida || "Não indicado"}
Saída:        ${data.saida}
Voo Regresso: ${data.voo_regresso || "Não indicado"}
Dias:         ${data.dias}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🅿️ ESTACIONAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━
Tipo:         ${data.tipo}
Extras:       ${data.extras || "Nenhum"}
Estimativa:   ${data.estimativa}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Notas: ${data.notas || "—"}

Pedido recebido em: ${timestamp}
    `;

    MailApp.sendEmail({
      to: "reservas@parquep5.pt",
      subject: `🅿️ Nova Reserva ParqueP5 — ${data.nome} | Entrada: ${data.entrada}`,
      body: emailBody
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Reserva registada com sucesso." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ParqueP5 API online" }))
    .setMimeType(ContentService.MimeType.JSON);
}
