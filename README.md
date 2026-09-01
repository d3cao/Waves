# Waves
### **1. Objetivo do Projeto**

Desenvolver uma extensão para navegadores web que promova a acessibilidade digital para a comunidade surda e pessoas com déficits de leitura/compreensão. A ferramenta permitirá a tradução dinâmica de conteúdos em texto para a Língua Brasileira de Sinais (Libras) em qualquer site, além de oferecer a simplificação de textos complexos por meio de Inteligência Artificial.

  

### **2. Escopo do Projeto**

- **Injeção Dinâmica de Recursos:** Permitir que o tradutor de Libras funcione em qualquer página web, independentemente de suporte nativo prévio do site.
    
      
    
- **Integração com VLibras:** Utilização dos serviços/APIs públicas do ecossistema VLibras (Governo Federal / Lavid-UFPB) para a renderização do avatar 3D e tradução do texto selecionado ou da página.
    
      
    
- **Processamento de Linguagem Natural (IA):** Agente de Inteligência Artificial responsável por pré-processar e reescrever trechos de texto em linguagem simples antes ou em paralelo ao envio para a tradução.
    
      
    

### **3. Arquitetura da Solução**

```
[ Usuário / Navegador Web ]
       │
       ├──► 1. Seleção de Texto / Interação
       │
       ├──► 2. Agente de IA (LLM / NLP)
       │         └── Simplificação e adequação gramatical do texto
       │
       └──► 3. API Pública do VLibras
                 └── Geração da animação em Libras (Avatar 3D)
```

#### **Componentes Chave**

1. **Content Script (Extensão):** Atua no DOM do navegador para capturar o texto selecionado e injetar a interface do avatar 3D.
    
      
    
2. **Agente de IA (Simplificação Textual):**
    
      
    - Reduz frases complexas, ambiguidades, estruturas passivas e jargões.
        
          
        
    - Transforma o texto para uma estrutura sintática mais direta, facilitando a interpretação tanto por humanos quanto pela própria engine de tradução do VLibras.
        
          
        
3. **Engine VLibras:** Consumo dos endpoints públicos para converter o texto simplificado na sequência de glosas/gestos do avatar.
    
      
    

### **4. Principais Funcionalidades**

- **Tradução Sob Demanda:** O usuário seleciona qualquer trecho de texto e ativa a tradução via menu de contexto ou botão flutuante.
    
      
    
- **Modo Texto Simplificado:** Opção para exibir o texto reescrito pela IA diretamente na tela, auxiliando também usuários com baixa escolaridade ou dislexia.
    
      
    
- **Avatar Interativo:** Janela sobreposta (widget) com o avatar do VLibras para exibição dos sinais, com controles de velocidade, pausa e redimensionamento.
    
      
    
- **Compatibilidade Universal:** Funcionalidade garantida em portais de notícias, blogs, redes sociais e sistemas corporativos web sem a necessidade de alteração do código-fonte dos sites de origem.
