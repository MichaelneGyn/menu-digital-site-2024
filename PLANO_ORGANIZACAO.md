# 🧹 PLANO DE ORGANIZAÇÃO - LIMPEZA DO PROJETO

## 📊 **SITUAÇÃO ATUAL:**
- ❌ ~80 arquivos no root
- ❌ Guias de coisas já implementadas
- ❌ Scripts espalhados
- ❌ Difícil encontrar o que precisa

## 🎯 **OBJETIVO:**
- ✅ Root limpo (~12 arquivos essenciais)
- ✅ Documentação organizada em `docs/`
- ✅ Scripts organizados em `scripts/`
- ✅ Histórico preservado em `archive/`

---

## 📁 **ESTRUTURA FINAL:**

```
menu-digital-site-2024/
├── 📄 package.json                 ✅ ESSENCIAL
├── 📄 next.config.js               ✅ ESSENCIAL
├── 📄 tsconfig.json                ✅ ESSENCIAL
├── 📄 tailwind.config.ts           ✅ ESSENCIAL
├── 📄 postcss.config.js            ✅ ESSENCIAL
├── 📄 .gitignore                   ✅ ESSENCIAL
├── 📄 .env.example                 ✅ ESSENCIAL
├── 📄 README.md                    ✅ PRINCIPAL
├── 📄 SECURITY.md                  ✅ IMPORTANTE
├── 📄 COLA_NO_BLOCO_DE_NOTAS.txt  ✅ GUIA RÁPIDO
├── 📄 COMANDOS_RAPIDOS.md          ✅ REFERÊNCIA
│
├── 📁 docs/                        (documentação útil)
│   ├── COMO_TESTAR_SEM_AFETAR_CLIENTES.md
│   ├── WORKFLOW_BRANCHES.md
│   ├── CHECKLIST_POS_DEPLOY.md
│   ├── GUIA_RAPIDO_DEPLOY.md
│   └── README.md (índice)
│
├── 📁 scripts/                     (scripts organizados)
│   ├── database/
│   │   ├── verificar-dados.sql
│   │   ├── check-restaurant-slug.sql
│   │   └── ...
│   ├── utils/
│   │   ├── gerar-hash-senha.js
│   │   ├── testar-conexao.js
│   │   ├── verificar-arquivos-criticos.js
│   │   └── ...
│   └── local/
│       ├── start-local.bat
│       ├── meu-ip.bat
│       └── ...
│
├── 📁 archive/                     (obsoletos mas preservados)
│   ├── guias-implementados/
│   │   ├── ALINHAR_BANCOS.md
│   │   ├── CORRECAO_IMAGENS.md
│   │   ├── SENHA_CORRETA.md
│   │   └── ...
│   ├── scripts-antigos/
│   │   ├── migrar-dados.js
│   │   ├── exportar-neon.sql
│   │   └── ...
│   └── README.md (o que tem aqui)
│
├── 📁 app/                         ✅ CÓDIGO (não mexer)
├── 📁 components/                  ✅ CÓDIGO (não mexer)
├── 📁 lib/                         ✅ CÓDIGO (não mexer)
├── 📁 prisma/                      ✅ CÓDIGO (não mexer)
└── ...
```

---

## 🗂️ **CATEGORIZAÇÃO DETALHADA:**

### **✅ MANTER NO ROOT (12 arquivos):**
```
package.json
package-lock.json
next.config.js
tsconfig.json
tsconfig.tsbuildinfo
tailwind.config.ts
postcss.config.js
.gitignore
.env.example
README.md
SECURITY.md
COLA_NO_BLOCO_DE_NOTAS.txt
COMANDOS_RAPIDOS.md
middleware.ts
next-env.d.ts
vercel.json
netlify.toml
```

---

### **📁 MOVER PARA `docs/` (úteis):**
```
COMO_TESTAR_SEM_AFETAR_CLIENTES.md
WORKFLOW_BRANCHES.md
CHECKLIST_POS_DEPLOY.md
GUIA_RAPIDO_DEPLOY.md
CORRECOES_SEGURANCA_PENDENTES.md
```

---

### **🗄️ MOVER PARA `archive/guias-implementados/`:**
```
ALINHAR_BANCOS.md
ATUALIZAR_SENHA.md
CHECKLIST_FINAL.md
CONFIGURAR_VERCEL.md
CONFIGURAR_VERCEL_VARS.md
CORRECAO_IMAGENS.md
CORRECAO_MENU_CATEGORIAS.md
CORRECAO_VALIDACAO_CUPONS.md
CORRIGIR_CMV.md
CORRIGIR_ERRO_401_VERCEL.md
CUPONS_GUIA.md
ENV_CORRETO.txt
FORMATACAO_PRECO_AUTOMATICA.md
FUNCIONALIDADE_EDITAR_ITENS.md
GUIA_ICONES_CATEGORIAS.md
GUIA_MIGRACAO_SUPABASE.md
ICONES_3D_TWEMOJI.md
IMPLEMENTACAO_SAAS.md
IMPORTAR_NO_SUPABASE.md
INICIAR_SERVIDOR_LOCAL.md
INSTRUCOES_ATIVAR_STATUS.md
OPENCAGE_SETUP.md
PAGAMENTOS_GUIA.md
PIX_GUIA_COMPLETO.md
PROTOTIPO_CUSTOMIZACOES.md
RESOLUCAO_UNKNOWN_AT_RULE.md
SENHA_CORRETA.md
SISTEMA_CMV_README.md
SISTEMA_COMPLETO.md
SISTEMA_CUPONS.md
SISTEMA_STATUS_PEDIDOS.md
TESTAR_NO_CELULAR.md
TESTE_DISPOSITIVO.md
TESTE_QR_CODE_PIX.md
VERCEL_CONFIG.md
VERCEL_SETUP_RAPIDO.md
```

---

### **🔧 MOVER PARA `scripts/database/`:**
```
ATUALIZAR_SENHA.sql
LIMPAR_BANCO.sql
exportar-neon.sql
migration-manual.sql
verificar-dados.sql
verificar-e-corrigir.sql
check-restaurant-slug.sql
```

---

### **🔧 MOVER PARA `scripts/utils/`:**
```
corrigir-placeholder.js
gerar-hash-novo.js
gerar-hash-senha.js
gerar-inserts-arquivo.js
gerar-inserts.js
gerar-sql-senha.js
migrar-dados.js
reimportar-dados.js
resetar-senha-admin.js
test-pix.js
testar-conexao.js
testar-login.js
verificar-imagens.js
verificar-vinculo.js
verificar-arquivos-criticos.js
```

---

### **🔧 MOVER PARA `scripts/local/`:**
```
fix-prisma.ps1
meu-ip.bat
restart-local.bat
start-local-simple.ps1
start-local.bat
start-local.ps1
start-server.ps1
```

---

### **🗑️ DELETAR (obsoletos/duplicados):**
```
prototipo-visual.html (protótipo antigo)
yarn.mcv (arquivo de lock duplicado se não usa Yarn)
testsprite_tests/ (testes que não servem mais)
tmp/ (temporários)
```

---

## 📋 **AÇÕES:**

1. Criar estrutura de pastas
2. Mover arquivos
3. Criar READMEs em cada pasta
4. Commit e push
5. Verificar se tudo funcionou

---

## ✅ **RESULTADO ESPERADO:**

**ANTES:**
```
Root: ~80 arquivos 😱
```

**DEPOIS:**
```
Root: ~12 arquivos ✅
docs/: 5-6 arquivos úteis ✅
scripts/: bem organizados ✅
archive/: histórico preservado ✅
```

---

## 🎯 **BENEFÍCIOS:**

- ✅ Fácil encontrar o que precisa
- ✅ Projeto profissional
- ✅ Onboarding mais rápido
- ✅ Manutenção facilitada
- ✅ Menos confusão
