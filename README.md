# Mireva Book

Leitor mobile local de PDFs, construído com React Native, Expo e TypeScript. O MVP organiza os documentos em uma biblioteca visual, abre uma página por vez, mantém um cache curto ao redor da página atual e salva automaticamente o progresso no SQLite.

## O que já funciona

- importação de PDFs pelo seletor nativo do Android/iOS;
- cópia permanente do arquivo para o sandbox do aplicativo;
- validação do cabeçalho do PDF antes da criação do registro;
- leitura da quantidade real de páginas e geração da capa a partir da primeira página;
- biblioteca em duas colunas, ordenada pelo acesso mais recente;
- progresso com página atual, total e porcentagem;
- leitor página a página com swipe horizontal e transição 3D acompanhando o dedo;
- pré-carregamento apenas de `N - 1`, `N`, `N + 1` e `N + 2`;
- navegação por slider, retomada automática e modo claro/escuro no leitor;
- marcador local por livro/página;
- exclusão confirmada do registro, marcadores, PDF, capa e cache do livro;
- estados de carregamento e mensagens de erro recuperáveis.

## Stack

- Expo SDK 57 / React Native 0.86;
- Expo Router;
- `expo-document-picker` e `expo-file-system`;
- `expo-sqlite`;
- `react-native-gesture-handler` e `react-native-reanimated`;
- `@react-native-community/slider`;
- `@dariyd/react-native-pdf-page-image` 2.0.0.

## Decisão sobre PDF

O projeto usa [`@dariyd/react-native-pdf-page-image`](https://github.com/dariyd/react-native-pdf-page-image). A biblioteca foi criada para a New Architecture (React Native 0.76+), usa `PdfRenderer` nativo no Android e `PDFKit` no iOS, informa a contagem de páginas e renderiza uma página específica por índice. Isso evita manter um PDF inteiro ou centenas de bitmaps na árvore React.

As imagens temporárias são cacheadas pelo módulo por URI/página/configuração. O hook do leitor mantém referências React apenas para quatro páginas próximas e chama `close()` ao sair para liberar a sessão e os temporários. A capa é uma cópia persistente separada.

Por ser um módulo nativo, o aplicativo **não roda no Expo Go**. É necessário um Development Build local ou via EAS.

## Instalação

Pré-requisitos: Node.js 22.13 ou superior para o Expo SDK 57, Android Studio/SDK para build local e, para iOS local, macOS com Xcode.

```bash
npm install
```

## Rodar no Android

### Build local

Com um emulador aberto ou aparelho conectado com depuração USB:

```bash
npm run android
```

Esse comando executa `expo run:android`, gera o projeto nativo quando necessário, compila e instala o Development Build. Depois da primeira compilação, inicie o bundler com:

```bash
npm start
```

Uma nova compilação nativa é necessária quando uma dependência nativa mudar.

### EAS Development Build

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
npm start
```

Instale o APK produzido pelo EAS no aparelho antes de abrir o bundler.

## iOS

Em um Mac com Xcode:

```bash
npm run ios
```

O módulo de PDF requer iOS 15 ou superior; o Expo SDK 57 já define uma versão mínima superior. O foco de validação deste MVP é Android.

## Banco local

O arquivo `reader.db` é aberto uma única vez por processo. A migration ativa WAL e foreign keys e cria as tabelas `books` e `bookmarks`. Um índice único impede duplicar o mesmo marcador na mesma página. Não há backend ou conexão com nuvem.

## Arquivos locais

O `expo-file-system` usa o sandbox do aplicativo:

```text
document/
  books/<id-aleatorio>.pdf
  covers/<id-aleatorio>.jpg

cache/
  page-cache/
  (temporários do renderizador nativo)
```

Cada importação recebe um nome interno único. Importar o mesmo PDF novamente cria outra entrada independente, sem sobrescrever a primeira.

## Estrutura

```text
app/
  _layout.tsx
  index.tsx
  reader/[bookId].tsx
src/
  components/
    BookCard.tsx
    EmptyLibrary.tsx
    PageTurn.tsx
    ReaderControls.tsx
    ReaderPage.tsx
  constants/theme.ts
  database/
    database.ts
    books.repository.ts
    bookmarks.repository.ts
  hooks/
    useBooks.ts
    useReader.ts
  services/
    library.service.ts
    pdf.service.ts
    storage.service.ts
  types/book.ts
```

## Verificações

```bash
npm run typecheck
npm run doctor
```

## Limitações atuais

- sem login, sincronização, backup ou nuvem;
- sem busca textual, seleção de texto, OCR ou anotações complexas;
- sem EPUB;
- sem tela de listagem dos marcadores (o toggle já é persistido);
- sem edição de título ou metadados;
- PDFs protegidos por senha não têm interface para informar a senha;
- páginas são rasterizadas para leitura, então não há texto selecionável;
- a qualidade final e o uso de memória ainda devem ser medidos em aparelhos Android de entrada com PDFs reais de 500+ páginas.

## Próximos passos recomendados

1. Testes de integração em aparelhos Android de diferentes faixas de memória.
2. Tela compacta de marcadores com salto para a página.
3. Ajuste adaptativo da resolução de render conforme tamanho/densidade da tela.
4. Pinch-to-zoom da página sem aumentar a janela de cache.
5. Instrumentação local de tempo de importação e renderização para PDFs grandes.
