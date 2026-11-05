console.log("APP CARREGADO");

let excelData = [];
let selectedColumns = [];

const columnLabels = {

    "Shipment ID":
        "Shipment",

    "Carrier Name":
        "Transportadora",

    "Status_1":
        "Status Operacional",

    "Start Time":
        "Start Time",

    "End Time":
        "End Time",

    "Source Location Name":
        "Origem",

    "Destination Location Name":
        "Destino",

    "Total Items":
        "Itens",

    "Total Actual Cost":
        "Valor Frete"

};

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("fileInput")
        .addEventListener("change", loadExcel);

    document.getElementById("configColumns")
        .addEventListener("click", toggleColumns);

    [
        "searchInput",
        "statusFilter",
        "providerFilter",
        "sourceFilter",
        "destinationFilter",
        "dateStart",
        "dateEnd"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.addEventListener(
                "input",
                renderTable
            );

            element.addEventListener(
                "change",
                renderTable
            );

        }

    });

    // Se a aba foi recarregada pelo Chrome (economia de memória) ou o
    // usuário voltou depois de um tempo, tenta restaurar os dados do
    // último Excel carregado nesta mesma aba, sem precisar escolher o
    // arquivo de novo.
    restoreFromSession();

});

function loadExcel(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const data = e.target.result;

            const workbook =
                XLSX.read(data, {
                    type: "binary"
                });

            const sheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];

            excelData =
                XLSX.utils.sheet_to_json(sheet);

            if(
                !validateFileStructure()
            ){
                return;
            }

            excelData.forEach(row => {

                const carrierId =
                    String(
                        row["Service Provider ID"]
                    );

                row["Carrier Name"] =
                    APP_CONFIG.carriers[carrierId]
                    || carrierId;

            });

            if (excelData.length === 0) {

                alert(
                    "Nenhum registro encontrado."
                );

                return;

            }

            initializeColumns();

            renderTable();

            saveToSession(file.name);

        }
        catch (error) {

            console.error(error);

            alert(
                "Erro ao carregar o Excel."
            );

        }

    };

    reader.readAsBinaryString(file);

}

function validateFileStructure(){

    const requiredColumns = [

        "Shipment ID",
        "Service Provider ID",
        "Start Time",
        "End Time",
        "Status_1"

    ];

    const columns =
        Object.keys(
            excelData[0]
        );

    const missingColumns =
        requiredColumns.filter(
            col =>
                !columns.includes(col)
        );

    if(
        missingColumns.length > 0
    ){

        alert(
            "Arquivo inválido.\n\nColunas ausentes:\n" +
            missingColumns.join("\n")
        );

        return false;

    }

    return true;

}

function initializeColumns() {

    const columns = [

        ...APP_CONFIG.defaultColumns,

        ...Object.keys(excelData[0])
            .filter(col =>
                !APP_CONFIG.defaultColumns.includes(col)
                &&
                !APP_CONFIG.ignoredColumns.includes(col)
            )

    ];

    const savedColumns =
        JSON.parse(
            localStorage.getItem(
                "selectedColumns"
            )
        );

    if (savedColumns) {

        selectedColumns =
            columns.filter(
                col =>
                    savedColumns.includes(col)
            );

    } else {

        selectedColumns =
            [...APP_CONFIG.defaultColumns];

    }

    buildColumnSelector(columns);

    buildFilters();

}

function buildColumnSelector(columns) {

    const selector =
        document.getElementById(
            "columnSelector"
        );

    selector.innerHTML = "";

    columns.forEach(column => {

        const checked =
            selectedColumns.includes(column)
                ? "checked"
                : "";

        selector.innerHTML += `
            <label style="display:block;margin-bottom:6px;">
                <input type="checkbox"
                       value="${column}"
                       ${checked}>
                ${column}
            </label>
        `;

    });

    document
        .querySelectorAll(
            "#columnSelector input"
        )
        .forEach(item => {

            item.addEventListener(
                "change",
                saveColumns
            );

        });

}

function saveColumns() {

    const visibleColumns = [];

    document
        .querySelectorAll(
            "#columnSelector input:checked"
        )
        .forEach(item => {

            visibleColumns.push(
                item.value
            );

        });

    const allColumns = [

        ...APP_CONFIG.defaultColumns,

        ...Object.keys(excelData[0])
            .filter(col =>
                !APP_CONFIG.defaultColumns.includes(col)
                &&
                !APP_CONFIG.ignoredColumns.includes(col)
            )

    ];

    selectedColumns =
        allColumns.filter(
            col =>
                visibleColumns.includes(col)
        );

    localStorage.setItem(
        "selectedColumns",
        JSON.stringify(
            visibleColumns
        )
    );

    renderTable();

}

function toggleColumns() {

    const selector =
        document.getElementById(
            "columnSelector"
        );

    selector.style.display =
        selector.style.display === "block"
            ? "none"
            : "block";

}

function buildFilters() {

    populateFilter(
        "statusFilter",
        "Status_1"
    );

    populateFilter(
        "providerFilter",
        "Carrier Name"
    );

    populateFilter(
        "sourceFilter",
        "Source Location Name"
    );

    populateFilter(
        "destinationFilter",
        "Destination Location Name"
    );

}

function populateFilter(
    filterId,
    columnName
) {

    const filter =
        document.getElementById(
            filterId
        );

    if (!filter) return;

    const firstOption =
        filter.options[0].outerHTML;

    filter.innerHTML =
        firstOption;

    const values =
        [
            ...new Set(
                excelData.map(
                    row =>
                        row[columnName]
                )
            )
        ]
            .filter(Boolean)
            .sort();

    values.forEach(value => {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = value;

        filter.appendChild(option);

    });

}

function loadCards() {

    document.getElementById(
        "totalShipments"
    ).textContent =
        excelData.length;

    const carriers =
        new Set(
            excelData.map(
                row => row["Carrier Name"]
            )
        );

    let cost = 0;

    excelData.forEach(row => {

        cost += Number(
            row["Total Actual Cost"] || 0
        );

    });

    document.getElementById(
        "totalCost"
    ).textContent =
        cost.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    document.getElementById(
        "totalCarriers"
    ).textContent =
        carriers.size;

}

function formatExcelDateTime(serial){

    if(
        serial === null ||
        serial === undefined ||
        serial === ""
    ){
        return "";
    }

    if(typeof serial !== "number"){
        return serial;
    }

    const excelEpoch =
        new Date(
            Date.UTC(
                1899,
                11,
                30
            )
        );

    const totalSeconds =
        serial * 86400;

    const date =
        new Date(
            excelEpoch.getTime()
            +
            Math.round(
                totalSeconds
            ) * 1000
        );

    const day =
        String(
            date.getUTCDate()
        ).padStart(2,"0");

    const month =
        String(
            date.getUTCMonth() + 1
        ).padStart(2,"0");

    const year =
        date.getUTCFullYear();

    const hour =
        String(
            date.getUTCHours()
        ).padStart(2,"0");

    const minute =
        String(
            date.getUTCMinutes()
        ).padStart(2,"0");

    return `${day}/${month}/${year} ${hour}:${minute}`;

}

function excelToDate(serial){

    if(!serial){
        return null;
    }

    const excelEpoch =
        new Date(
            Date.UTC(
                1899,
                11,
                30
            )
        );

    return new Date(
        excelEpoch.getTime()
        +
        serial * 86400 * 1000
    );

}

function updateCards(data) {

    document.getElementById(
        "totalShipments"
    ).textContent =
        data.length;

    let cost = 0;

    const carriers =
        new Set();

    data.forEach(row => {

        cost += Number(
            row["Total Actual Cost"] || 0
        );

        carriers.add(
            row["Carrier Name"]
        );

    });

    document.getElementById(
        "totalCost"
    ).textContent =
        cost.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    document.getElementById(
        "totalCarriers"
    ).textContent =
        carriers.size;

}

// Guarda o Excel já carregado nesta aba (sessionStorage dura enquanto a
// aba estiver aberta e sobrevive a um reload automático do Chrome, mas
// some sozinho quando a aba é fechada — não fica dado da empresa salvo
// indefinidamente no navegador).
function saveToSession(fileName) {

    try {

        sessionStorage.setItem(
            "excelData",
            JSON.stringify(excelData)
        );

        sessionStorage.setItem(
            "excelFileName",
            fileName || ""
        );

    } catch (error) {

        console.warn(
            "Não foi possível salvar os dados na sessão.",
            error
        );

    }

}

// Roda ao abrir/recarregar a página. Se houver dados salvos desta mesma
// aba, restaura a tabela automaticamente sem pedir pra escolher o
// arquivo de novo.
function restoreFromSession() {

    try {

        const saved =
            sessionStorage.getItem("excelData");

        if (!saved) return;

        const parsed =
            JSON.parse(saved);

        if (
            !Array.isArray(parsed) ||
            parsed.length === 0
        ) {
            return;
        }

        excelData = parsed;

        const fileName =
            sessionStorage.getItem(
                "excelFileName"
            );

        if (fileName) {

            const hint =
                document.createElement("span");

            hint.textContent =
                ` ${fileName} (restaurado automaticamente)`;

            document
                .getElementById("fileInput")
                .insertAdjacentElement(
                    "afterend",
                    hint
                );

        }

        initializeColumns();

        renderTable();

    } catch (error) {

        console.warn(
            "Não foi possível restaurar os dados da sessão.",
            error
        );

    }

}

function renderTable() {

    if (excelData.length === 0)
        return;

    const startDate =
        document.getElementById(
            "dateStart"
        )?.value || "";

    const endDate =
        document.getElementById(
            "dateEnd"
        )?.value || "";

    const search =
        document.getElementById(
            "searchInput"
        )?.value
            .toLowerCase() || "";

    const status =
        document.getElementById(
            "statusFilter"
        )?.value || "";

    const provider =
        document.getElementById(
            "providerFilter"
        )?.value || "";

    const source =
        document.getElementById(
            "sourceFilter"
        )?.value || "";

    const destination =
        document.getElementById(
            "destinationFilter"
        )?.value || "";

    let filteredData =
        excelData.filter(row => {

            const shipment =
                String(
                    row["Shipment ID"] || ""
                );

            const matchSearch =
                shipment
                    .toLowerCase()
                    .includes(search);

            const matchStatus =
                !status ||
                row["Status_1"] === status;

            const matchProvider =
                !provider ||
                row["Carrier Name"] === provider;

            const matchSource =
                !source ||
                row["Source Location Name"] === source;

            const matchDestination =
                !destination ||
                row["Destination Location Name"] === destination;

            let matchDate = true;

            if (startDate || endDate) {

                const shipmentDate =
                    excelToDate(
                        row["Start Time"]
                    );

                if (shipmentDate) {

                        const shipmentOnly =
                        `${shipmentDate.getUTCFullYear()}-${
                        String(
                        shipmentDate.getUTCMonth()+1
                        ).padStart(2,"0")
                        }-${
                        String(
                        shipmentDate.getUTCDate()
                        ).padStart(2,"0")
                        }`;

                    if (
                        startDate &&
                        shipmentOnly < startDate
                    ) {
                        matchDate = false;
                    }

                    if (
                        endDate &&
                        shipmentOnly > endDate
                    ) {
                        matchDate = false;
                    }

                }

            }

            return (
                matchSearch
                &&
                matchStatus
                &&
                matchProvider
                &&
                matchSource
                &&
                matchDestination
                &&
                matchDate
            );

        });

        filteredData.sort((a, b) => {

            return (
                a["Start Time"] || 0
            )
                -
                (
                    b["Start Time"] || 0
                );

        });

        updateCards(
            filteredData
        );

    const thead =
        document.querySelector(
            "#shipmentTable thead"
        );

    const tbody =
        document.querySelector(
            "#shipmentTable tbody"
        );

    thead.innerHTML = "";
    tbody.innerHTML = "";

    let header = "<tr>";

    selectedColumns.forEach(column => {

        header += `
        <th>
        ${columnLabels[column] || column}
        </th>
        `;

    });

    header += "</tr>";

    thead.innerHTML = header;

    // Monta todas as linhas UMA única vez (antes havia um forEach duplicado
    // que reconstruía a tabela inteira a cada linha, O(n²) desnecessário).
    let rowsHtml = "";

    filteredData.forEach(row => {

        let html = "<tr>";

        selectedColumns.forEach(column => {

            let value =
                row[column];

            if (
                column.includes("Time")
            ) {

                value =
                    formatExcelDateTime(
                        value
                    );

            }

            html += `
                <td>
                    ${value ?? ""}
                </td>
            `;

        });

        html += "</tr>";

        rowsHtml += html;

    });

    tbody.innerHTML = rowsHtml;

}
