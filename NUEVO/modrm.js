// modrm.js
const tabla_operandos = {
  // mapeo de registros 
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

  // modos de direccionamiento de memoria 
  memoria: {
    "BX+SI": "000",
    "BX+DI": "001",
    "BP+SI": "010",
    "BP+DI": "011",
    "SI":    "100",
    "DI":    "101",
    "BP":    "110", 
    "BX":    "111"
  }
};

export default tabla_operandos;