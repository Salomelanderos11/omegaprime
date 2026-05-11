// opcodes.js

const tabla_opcodes = {
  "MOV": [
    { operandos: ["Reg", "Reg"], opcode: "100010dw", modrm: true,  reg_ext: null },
    { operandos: ["Reg", "Mem"], opcode: "100010dw", modrm: true,  reg_ext: null },
    { operandos: ["Mem", "Reg"], opcode: "100010dw", modrm: true,  reg_ext: null },
    { operandos: ["Reg", "Vi"],  opcode: "1011w",    modrm: false, reg_ext: null },
    { operandos: ["Mem", "Vi"],  opcode: "1100011w", modrm: true,  reg_ext: "000" }
  ],
  "ADD": [
    { operandos: ["Reg", "Reg"], opcode: "000000dw", modrm: true,  reg_ext: null },
    { operandos: ["Reg", "Vi"],  opcode: "100000sw", modrm: true,  reg_ext: "000" },
    { operandos: ["Mem", "Vi"],  opcode: "100000sw", modrm: true,  reg_ext: "000" } 
  ],
  "SUB": [
    { operandos: ["Reg", "Reg"], opcode: "001010dw", modrm: true,  reg_ext: null },
    { operandos: ["Reg", "Vi"],  opcode: "100000sw", modrm: true,  reg_ext: "101" }
  ],
  "XOR": [
    { operandos: ["Reg", "Reg"], opcode: "001100dw", modrm: true,  reg_ext: null }
  ],
  "CMP": [
    { operandos: ["Reg", "Reg"], opcode: "001110dw", modrm: true,  reg_ext: null },
    { operandos: ["Reg", "Vi"],  opcode: "100000sw", modrm: true,  reg_ext: "111" },
    { operandos: ["Mem", "Vi"],  opcode: "100000sw", modrm: true,  reg_ext: "111" }
  ],
  "INC": [
    { operandos: ["Reg"],        opcode: "01000",    modrm: false, reg_ext: null },
    { operandos: ["Mem"],        opcode: "1111111w", modrm: true,  reg_ext: "000" }
  ],
  "NEG": [
    { operandos: ["Reg"],        opcode: "1111011w", modrm: true,  reg_ext: "011" }
  ],
  "DIV": [
    { operandos: ["Reg"],        opcode: "1111011w", modrm: true,  reg_ext: "110" }
  ],
  "IDIV": [
    { operandos: ["Reg"],        opcode: "1111011w", modrm: true,  reg_ext: "111" }
  ],
  "IMUL": [
    { operandos: ["Reg"],        opcode: "1111011w", modrm: true,  reg_ext: "101" }
  ],
  // --- SALTOS Y CONTROL ---
  "JMP":  [{ operandos: ["Mem"], opcode: "11101011", modrm: false, reg_ext: null }],
  "JE":   [{ operandos: ["Mem"], opcode: "01110100", modrm: false, reg_ext: null }],
  "JNE":  [{ operandos: ["Mem"], opcode: "01110101", modrm: false, reg_ext: null }],
  "JG":   [{ operandos: ["Mem"], opcode: "01111111", modrm: false, reg_ext: null }],
  "JGE":  [{ operandos: ["Mem"], opcode: "01111101", modrm: false, reg_ext: null }],
  "LOOP": [{ operandos: ["Mem"], opcode: "11100010", modrm: false, reg_ext: null }],
  "CALL": [{ operandos: ["Mem"], opcode: "11101000", modrm: false, reg_ext: null }],
  "RET":  [{ operandos: [],      opcode: "11000011", modrm: false, reg_ext: null }],
  "INT":  [{ operandos: ["Vi"],  opcode: "11001101", modrm: false, reg_ext: null }],
  "PUSH": [{ operandos: ["Reg"], opcode: "01010",    modrm: false, reg_ext: null }],
  "POP":  [{ operandos: ["Reg"], opcode: "01011",    modrm: false, reg_ext: null }],
  "LEA":  [{ operandos: ["Reg", "Mem"], opcode: "10001101", modrm: true, reg_ext: null }],
  "CWD":  [{ operandos: [],      opcode: "10011001", modrm: false, reg_ext: null }],
  
  "END":  [{ operandos: ["Mem"], opcode: "00000000", modrm: false, reg_ext: null }],
  
  "JL":   [{ operandos: ["Mem"], opcode: "01111100", modrm: false, reg_ext: null }]
};

export default tabla_opcodes;