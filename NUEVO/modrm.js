// modrm.js
const tabla_operandos = {
  // Mapeo de Registros (Campo REG o R/M con MOD=11)
  registros: {
    "AL": { rm: "000", w: "0" },
    "AX": { rm: "000", w: "1" },
    "CL": { rm: "001", w: "0" },
    "CX": { rm: "001", w: "1" },
    "DL": { rm: "010", w: "0" },
    "DX": { rm: "010", w: "1" },
    "BL": { rm: "011", w: "0" },
    "BX": { rm: "011", w: "1" },
    "AH": { rm: "100", w: "0" },
    "SP": { rm: "100", w: "1" },
    "CH": { rm: "101", w: "0" },
    "BP": { rm: "101", w: "1" },
    "DH": { rm: "110", w: "0" },
    "SI": { rm: "110", w: "1" },
    "BH": { rm: "111", w: "0" },
    "DI": { rm: "111", w: "1" }
  },

  // Modos de direccionamiento de memoria (Campo R/M con MOD < 11)
  memoria: {
    "BX+SI": "000",
    "BX+DI": "001",
    "BP+SI": "010",
    "BP+DI": "011",
    "SI":    "100",
    "DI":    "101",
    "BP":    "110", // Nota: Si MOD=00 y RM=110, es Direccionamiento Directo (D16)
    "BX":    "111"
  }
};

export default tabla_operandos;